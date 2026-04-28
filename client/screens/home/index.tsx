import { View, Text, TouchableOpacity, ActivityIndicator, Alert, StyleSheet, ScrollView } from 'react-native';
import { useState, useRef, useEffect } from 'react';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system/legacy';
import { Screen } from '@/components/Screen';
import { RNSSE } from 'react-native-sse';

type Mode = 'idle' | 'recording' | 'processing' | 'answering';

export default function HomePage() {
  const [mode, setMode] = useState<Mode>('idle');
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [question, setQuestion] = useState<string>('');
  const [answer, setAnswer] = useState<string>('');
  const recordingRef = useRef<Audio.Recording | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Audio.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const startRecording = async () => {
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

    try {
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      await recording.startAsync();
      recordingRef.current = recording;
      setMode('recording');
      setQuestion('');
      setAnswer('');
    } catch (error: any) {
      Alert.alert('录音失败', error.message || '请在真机上测试');
    }
  };

  const stopRecording = async () => {
    if (!recordingRef.current) return;

    try {
      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();
      recordingRef.current = null;
      setMode('processing');

      if (uri) {
        await processAudio(uri);
      } else {
        Alert.alert('错误', '录音无效');
        setMode('idle');
      }
    } catch (error) {
      setMode('idle');
    }
  };

  const processAudio = async (audioUri: string) => {
    try {
      const base64Audio = await (FileSystem as any).readAsStringAsync(audioUri, {
        encoding: (FileSystem as any).EncodingType.Base64,
      });

      setMode('answering');
      const url = `${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/chat/stream`;
      
      const sse = new RNSSE(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ audio: base64Audio }),
      });

      sse.addEventListener('message', (event: any) => {
        if (!event.data) return;
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'question') {
            setQuestion(data.content);
          } else if (data.type === 'answer') {
            setAnswer(prev => prev + data.content);
          } else if (data.type === 'done' || data.type === 'error') {
            sse.close();
            if (data.type === 'error') {
              Alert.alert('错误', data.message);
            }
          }
        } catch (e) {}
      });

      sse.addEventListener('error', () => {
        sse.close();
        Alert.alert('错误', '连接失败');
        setMode('idle');
      });

    } catch (error) {
      Alert.alert('错误', '处理失败');
      setMode('idle');
    }
  };

  const reset = () => {
    setMode('idle');
    setQuestion('');
    setAnswer('');
  };

  // Full screen answer view
  if (mode === 'answering' && answer) {
    return (
      <Screen statusBarStyle="light">
        <View style={styles.fullScreen}>
          <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
            <Text style={styles.label}>问题</Text>
            <Text style={styles.question}>{question}</Text>
            
            <View style={styles.divider} />
            
            <Text style={styles.label}>回答</Text>
            <Text style={styles.answer}>{answer}</Text>
          </ScrollView>
          
          <TouchableOpacity style={styles.resetButton} onPress={reset}>
            <Text style={styles.resetText}>继续提问</Text>
          </TouchableOpacity>
        </View>
      </Screen>
    );
  }

  // Idle / Recording / Processing view
  return (
    <Screen statusBarStyle="light">
      <View style={styles.container}>
        <Text style={styles.title}>泰州学院</Text>
        <Text style={styles.subtitle}>计算机科学与技术 · ASIIN座谈</Text>

        <TouchableOpacity
          style={[
            styles.recordButton,
            mode === 'recording' && styles.recordingButton
          ]}
          onPress={mode === 'recording' ? stopRecording : startRecording}
          disabled={mode === 'processing'}
        >
          {mode === 'processing' ? (
            <ActivityIndicator color="#fff" size="large" />
          ) : (
            <View style={[
              styles.recordIcon,
              mode === 'recording' && styles.recordingIcon
            ]} />
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
  // Full screen answer styles
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
});
