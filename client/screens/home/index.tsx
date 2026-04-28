import { View, Text, TouchableOpacity, ActivityIndicator, Alert, StyleSheet, ScrollView } from 'react-native';
import { useState, useRef, useEffect } from 'react';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system/legacy';
import { Screen } from '@/components/Screen';
import SSE from 'react-native-sse';

type Mode = 'idle' | 'recording' | 'processing' | 'answering';

export default function HomePage() {
  const [mode, setMode] = useState<Mode>('idle');
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [question, setQuestion] = useState<string>('');
  const [answer, setAnswer] = useState<string>('');
  const [error, setError] = useState<string>('');
  const recordingRef = useRef<Audio.Recording | null>(null);
  const eventSourceRef = useRef<any>(null);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Audio.requestPermissionsAsync();
        setHasPermission(status === 'granted');
      } catch (err) {
        console.error('Permission error:', err);
      }
    })();
    
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  const startRecording = async () => {
    console.log('Starting recording...');
    setError('');
    
    try {
      if (!hasPermission) {
        const { status } = await Audio.requestPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('需要权限', '请授予麦克风权限');
          return;
        }
        setHasPermission(true);
      }

      if (recordingRef.current) {
        await recordingRef.current.stopAndUnloadAsync();
        recordingRef.current = null;
      }

      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      await recording.startAsync();
      recordingRef.current = recording;
      setMode('recording');
      setQuestion('');
      setAnswer('');
      setError('');
      console.log('Recording started');
    } catch (err: any) {
      console.error('Start recording error:', err);
      Alert.alert('录音失败', err.message || String(err));
    }
  };

  const stopRecording = async () => {
    console.log('Stopping recording...');
    if (!recordingRef.current) {
      return;
    }

    try {
      const status = await recordingRef.current.getStatusAsync();
      console.log('Recording duration:', status.durationMillis);
      
      if (status.durationMillis < 500) {
        Alert.alert('录音太短', '请录制至少1秒钟');
        await recordingRef.current.stopAndUnloadAsync();
        recordingRef.current = null;
        setMode('idle');
        return;
      }

      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();
      recordingRef.current = null;
      
      console.log('Recording URI:', uri);
      
      if (uri) {
        setMode('processing');
        await processAudio(uri);
      } else {
        Alert.alert('错误', '录音文件无效');
        setMode('idle');
      }
    } catch (err: any) {
      console.error('Stop recording error:', err);
      Alert.alert('停止录音失败', err.message || String(err));
      setMode('idle');
    }
  };

  const processAudio = async (audioUri: string) => {
    console.log('Processing audio:', audioUri);
    setError('');
    
    try {
      // Read audio file as base64
      const base64Audio = await (FileSystem as any).readAsStringAsync(audioUri, {
        encoding: (FileSystem as any).EncodingType.Base64,
      });
      
      console.log('Base64 length:', base64Audio.length);
      
      if (base64Audio.length < 100) {
        Alert.alert('错误', '录音文件太小，请重新录音');
        setMode('idle');
        return;
      }

      setMode('answering');
      setQuestion('');
      setAnswer('');

      const baseUrl = process.env.EXPO_PUBLIC_BACKEND_BASE_URL;
      const url = `${baseUrl}/api/v1/chat/stream`;
      console.log('Request URL:', url);
      
      // Use EventSource for SSE
      const eventSource = new SSE(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ audio: base64Audio }),
      });
      
      eventSourceRef.current = eventSource;

      eventSource.addEventListener('message', (e: any) => {
        console.log('SSE message:', e.data);
        try {
          const data = JSON.parse(e.data);
          
          if (data.type === 'question') {
            setQuestion(data.content);
          } else if (data.type === 'answer') {
            setAnswer(prev => prev + data.content);
          } else if (data.type === 'done') {
            console.log('Stream complete');
            eventSource.close();
          } else if (data.type === 'error') {
            setError(data.message || '处理失败');
            eventSource.close();
          }
        } catch (err) {
          console.error('Parse error:', err);
        }
      });

      eventSource.addEventListener('error', (err: any) => {
        console.error('SSE error:', err);
        eventSource.close();
        Alert.alert('错误', '连接失败');
        setMode('idle');
      });

    } catch (err: any) {
      console.error('Process audio error:', err);
      setError(err.message || '处理失败');
      Alert.alert('错误', '处理音频失败: ' + (err.message || String(err)));
      setMode('idle');
    }
  };

  const reset = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setMode('idle');
    setQuestion('');
    setAnswer('');
    setError('');
  };

  // Full screen answer view
  if ((mode === 'answering' || mode === 'processing') && (answer || question)) {
    return (
      <Screen statusBarStyle="light">
        <View style={styles.fullScreen}>
          {mode === 'processing' && (
            <View style={styles.processingBar}>
              <ActivityIndicator color="#00f0ff" size="small" />
              <Text style={styles.processingText}>处理中...</Text>
            </View>
          )}
          
          <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
            <Text style={styles.label}>问题</Text>
            <Text style={styles.question}>{question || '...'}</Text>
            
            <View style={styles.divider} />
            
            <Text style={styles.label}>回答</Text>
            {mode === 'processing' && !answer ? (
              <View style={styles.loadingAnswer}>
                <ActivityIndicator color="#00f0ff" />
                <Text style={styles.loadingText}>生成回答中...</Text>
              </View>
            ) : (
              <Text style={styles.answer}>{answer || '...'}</Text>
            )}
          </ScrollView>
          
          <TouchableOpacity style={styles.resetButton} onPress={reset}>
            <Text style={styles.resetText}>继续提问</Text>
          </TouchableOpacity>
        </View>
      </Screen>
    );
  }

  // Error view
  if (error) {
    return (
      <Screen statusBarStyle="light">
        <View style={styles.container}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={reset}>
            <Text style={styles.retryText}>重试</Text>
          </TouchableOpacity>
        </View>
      </Screen>
    );
  }

  // Idle / Recording view
  return (
    <Screen statusBarStyle="light">
      <View style={styles.container}>
        <Text style={styles.title}>泰州学院</Text>
        <Text style={styles.subtitle}>计算机科学与技术 · ASIIN座谈</Text>

        <TouchableOpacity
          style={[styles.recordButton, mode === 'recording' && styles.recordingButton]}
          onPress={mode === 'recording' ? stopRecording : startRecording}
          disabled={mode === 'processing'}
        >
          {mode === 'processing' ? (
            <ActivityIndicator color="#fff" size="large" />
          ) : (
            <View style={[styles.recordIcon, mode === 'recording' && styles.recordingIcon]} />
          )}
        </TouchableOpacity>

        <Text style={styles.hint}>
          {mode === 'recording' ? '点击停止' : '点击录音'}
        </Text>
        <Text style={styles.subHint}>支持中英文提问</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0f',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
    marginBottom: 60,
  },
  recordButton: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#00f0ff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#00f0ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 10,
  },
  recordingButton: {
    backgroundColor: '#ef4444',
    shadowColor: '#ef4444',
  },
  recordIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#0a0a0f',
  },
  recordingIcon: {
    width: 24,
    height: 24,
    borderRadius: 4,
    backgroundColor: '#fff',
  },
  hint: {
    fontSize: 16,
    color: '#fff',
    marginTop: 30,
  },
  subHint: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
  },
  fullScreen: {
    flex: 1,
    backgroundColor: '#0a0a0f',
  },
  processingBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: '#1a1a2e',
    gap: 8,
  },
  processingText: {
    color: '#00f0ff',
    fontSize: 14,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 100,
  },
  label: {
    fontSize: 14,
    color: '#00f0ff',
    fontWeight: '600',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  question: {
    fontSize: 18,
    color: '#fff',
    lineHeight: 28,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#333',
    marginVertical: 30,
  },
  answer: {
    fontSize: 16,
    color: '#e0e0e0',
    lineHeight: 28,
  },
  loadingAnswer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    color: '#666',
    fontSize: 14,
  },
  resetButton: {
    position: 'absolute',
    bottom: 50,
    left: 24,
    right: 24,
    backgroundColor: '#00f0ff',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  resetText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0a0a0f',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#00f0ff',
    paddingHorizontal: 40,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    color: '#0a0a0f',
    fontWeight: '600',
  },
});
