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
  const [answerCN, setAnswerCN] = useState<string>('');
  const [answerEN, setAnswerEN] = useState<string>('');
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
      setAnswerCN('');
      setAnswerEN('');
      setError('');
    } catch (err: any) {
      Alert.alert('录音失败', err.message || String(err));
    }
  };

  const stopRecording = async () => {
    if (!recordingRef.current) return;

    try {
      const status = await recordingRef.current.getStatusAsync();
      
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
      
      if (uri) {
        setMode('processing');
        await processAudio(uri);
      } else {
        Alert.alert('错误', '录音文件无效');
        setMode('idle');
      }
    } catch (err: any) {
      Alert.alert('停止录音失败', err.message || String(err));
      setMode('idle');
    }
  };

  const processAudio = async (audioUri: string) => {
    setError('');
    
    try {
      const base64Audio = await (FileSystem as any).readAsStringAsync(audioUri, {
        encoding: (FileSystem as any).EncodingType.Base64,
      });
      
      if (base64Audio.length < 100) {
        Alert.alert('错误', '录音文件太小');
        setMode('idle');
        return;
      }

      setMode('answering');
      setQuestion('');
      setAnswerCN('');
      setAnswerEN('');

      const baseUrl = process.env.EXPO_PUBLIC_BACKEND_BASE_URL;
      const url = `${baseUrl}/api/v1/chat/stream`;
      
      const eventSource = new SSE(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ audio: base64Audio }),
      });
      
      eventSourceRef.current = eventSource;

      eventSource.addEventListener('message', (e: any) => {
        try {
          const data = JSON.parse(e.data);
          
          if (data.type === 'question') {
            setQuestion(data.content);
          } else if (data.type === 'answer_cn') {
            setAnswerCN(prev => prev + data.content);
          } else if (data.type === 'answer_en') {
            setAnswerEN(prev => prev + data.content);
          } else if (data.type === 'done') {
            eventSource.close();
          } else if (data.type === 'error') {
            setError(data.message);
            eventSource.close();
          }
        } catch (err) {}
      });

      eventSource.addEventListener('error', () => {
        eventSource.close();
        Alert.alert('错误', '连接失败');
        setMode('idle');
      });

    } catch (err: any) {
      Alert.alert('错误', '处理失败');
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
    setAnswerCN('');
    setAnswerEN('');
    setError('');
  };

  // Full screen answer view
  if ((mode === 'answering' || mode === 'processing') && (answerCN || answerEN || question)) {
    return (
      <Screen statusBarStyle="light">
        <View style={styles.fullScreen}>
          <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
            {/* Question */}
            <Text style={styles.label}>问题</Text>
            <Text style={styles.question}>{question || '...'}</Text>
            
            <View style={styles.divider} />
            
            {/* Chinese Answer */}
            <Text style={styles.labelCN}>中文回答</Text>
            {mode === 'processing' && !answerCN ? (
              <View style={styles.loading}>
                <ActivityIndicator color="#00f0ff" size="small" />
                <Text style={styles.loadingText}>生成中...</Text>
              </View>
            ) : (
              <Text style={styles.answerCN}>{answerCN || '...'}</Text>
            )}
            
            <View style={styles.divider} />
            
            {/* English Answer */}
            <Text style={styles.labelEN}>English Answer</Text>
            {mode === 'processing' && !answerEN ? (
              <View style={styles.loading}>
                <ActivityIndicator color="#3b82f6" size="small" />
                <Text style={styles.loadingText}>Generating...</Text>
              </View>
            ) : (
              <Text style={styles.answerEN}>{answerEN || '...'}</Text>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 100,
  },
  label: {
    fontSize: 16,
    color: '#888',
    fontWeight: '600',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  question: {
    fontSize: 22,
    color: '#fff',
    lineHeight: 34,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#222',
    marginVertical: 28,
  },
  labelCN: {
    fontSize: 18,
    color: '#00f0ff',
    fontWeight: '700',
    marginBottom: 16,
  },
  answerCN: {
    fontSize: 20,
    color: '#e0e0e0',
    lineHeight: 34,
  },
  labelEN: {
    fontSize: 18,
    color: '#3b82f6',
    fontWeight: '700',
    marginBottom: 16,
  },
  answerEN: {
    fontSize: 20,
    color: '#a0a0a0',
    lineHeight: 34,
  },
  loading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
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
