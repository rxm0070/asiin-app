import { View, Text, TouchableOpacity, ActivityIndicator, Alert, StyleSheet, ScrollView, Platform } from 'react-native';
import { useState, useRef, useEffect } from 'react';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system/legacy';
import { Screen } from '@/components/Screen';
import SSE from 'react-native-sse';

type Mode = 'idle' | 'recording' | 'processing' | 'answering';

// Web Audio API types
interface WebAudioRecorder {
  mediaRecorder: any;
  audioChunks: Blob[];
  startTime: number;
}

export default function HomePage() {
  const [mode, setMode] = useState<Mode>('idle');
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [question, setQuestion] = useState<string>('');
  const [questionCN, setQuestionCN] = useState<string>('');
  const [answerCN, setAnswerCN] = useState<string>('');
  const [answerEN, setAnswerEN] = useState<string>('');
  const [error, setError] = useState<string>('');
  const recordingRef = useRef<Audio.Recording | null>(null);
  const webRecorderRef = useRef<WebAudioRecorder | null>(null);
  const eventSourceRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  // Request permission before recording
  const requestPermission = async () => {
    if (Platform.OS === 'web') {
      return true;
    }
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status === 'granted') {
        setHasPermission(true);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  // Web-specific: Start recording using MediaRecorder API
  const startWebRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const audioChunks: Blob[] = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data);
        }
      };

      mediaRecorder.start();
      
      webRecorderRef.current = {
        mediaRecorder,
        audioChunks,
        startTime: Date.now(),
      };
      
      setMode('recording');
      setQuestion('');
      setQuestionCN('');
      setAnswerCN('');
      setAnswerEN('');
      setError('');
    } catch (err: any) {
      Alert.alert('录音失败', err.message || String(err));
    }
  };

  // Web-specific: Stop recording and get audio blob
  const stopWebRecording = async (): Promise<string | null> => {
    return new Promise((resolve) => {
      const recorder = webRecorderRef.current;
      if (!recorder) {
        resolve(null);
        return;
      }

      const duration = Date.now() - recorder.startTime;
      if (duration < 500) {
        Alert.alert('录音太短', '请录制至少1秒钟');
        recorder.mediaRecorder.stop();
        recorder.mediaRecorder.stream.getTracks().forEach((track: any) => track.stop());
        webRecorderRef.current = null;
        setMode('idle');
        resolve(null);
        return;
      }

      recorder.mediaRecorder.onstop = async () => {
        recorder.mediaRecorder.stream.getTracks().forEach((track: any) => track.stop());
        
        const audioBlob = new Blob(recorder.audioChunks, { type: 'audio/webm' });
        
        // Convert blob to base64
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = (reader.result as string).split(',')[1];
          webRecorderRef.current = null;
          resolve(base64);
        };
        reader.readAsDataURL(audioBlob);
      };

      recorder.mediaRecorder.stop();
    });
  };

  const startRecording = async () => {
    if (Platform.OS === 'web') {
      await startWebRecording();
      return;
    }
    
    console.log('Starting recording...');
    setError('');
    
    try {
      if (!hasPermission) {
        const granted = await requestPermission();
        if (!granted) {
          Alert.alert('需要权限', '请授予麦克风权限');
          return;
        }
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
      setQuestionCN('');
      setAnswerCN('');
      setAnswerEN('');
      setError('');
    } catch (err: any) {
      Alert.alert('录音失败', err.message || String(err));
    }
  };

  const stopRecording = async () => {
    if (Platform.OS === 'web') {
      const base64 = await stopWebRecording();
      if (base64 && base64.length > 100) {
        setMode('processing');
        await processAudioFromBase64(base64);
      }
      return;
    }

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

  // Process audio from base64 (Web)
  const getBaseUrl = () => {
    // 生产环境使用阿里云服务器
    if (process.env.NODE_ENV === 'production') {
      return 'http://120.55.245.100:9091';
    }
    // 开发环境使用环境变量
    return process.env.EXPO_PUBLIC_BACKEND_BASE_URL || 'http://localhost:9091';
  };

  const processAudioFromBase64 = async (base64Audio: string) => {
    setError('');
    
    if (base64Audio.length < 100) {
      Alert.alert('错误', '录音文件太小');
      setMode('idle');
      return;
    }

    setMode('answering');
    setQuestion('');
    setQuestionCN('');
    setAnswerCN('');
    setAnswerEN('');

    const baseUrl = getBaseUrl();
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
        } else if (data.type === 'question_cn') {
          setQuestionCN(data.content);
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
  };

  // Process audio from URI (Native)
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

      await processAudioFromBase64(base64Audio);
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
    setQuestionCN('');
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
            
            {/* Chinese Question (if English input) */}
            {questionCN ? (
              <>
                <Text style={styles.labelCN}>中文问题</Text>
                <Text style={styles.questionCN}>{questionCN}</Text>
              </>
            ) : null}
            
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
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  recordingButton: {
    backgroundColor: '#ff3b30',
    shadowColor: '#ff3b30',
  },
  recordIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#fff',
  },
  recordingIcon: {
    width: 24,
    height: 24,
    borderRadius: 4,
    backgroundColor: '#fff',
  },
  hint: {
    marginTop: 30,
    fontSize: 16,
    color: '#00f0ff',
  },
  subHint: {
    marginTop: 10,
    fontSize: 12,
    color: '#666',
  },
  fullScreen: {
    flex: 1,
    backgroundColor: '#0a0a0f',
    padding: 20,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  labelCN: {
    fontSize: 14,
    color: '#00f0ff',
    marginBottom: 8,
    marginTop: 16,
  },
  labelEN: {
    fontSize: 14,
    color: '#3b82f6',
    marginBottom: 8,
    marginTop: 16,
  },
  question: {
    fontSize: 18,
    color: '#fff',
    lineHeight: 26,
  },
  questionCN: {
    fontSize: 16,
    color: '#00f0ff',
    lineHeight: 24,
    backgroundColor: 'rgba(0, 240, 255, 0.1)',
    padding: 12,
    borderRadius: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#222',
    marginVertical: 20,
  },
  answerCN: {
    fontSize: 16,
    color: '#e0e0e0',
    lineHeight: 26,
  },
  answerEN: {
    fontSize: 14,
    color: '#a0a0a0',
    lineHeight: 24,
    fontStyle: 'italic',
  },
  loading: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginLeft: 10,
    color: '#666',
    fontSize: 14,
  },
  resetButton: {
    backgroundColor: '#1a1a2e',
    borderWidth: 1,
    borderColor: '#00f0ff',
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 20,
  },
  resetText: {
    color: '#00f0ff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    color: '#ff3b30',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#1a1a2e',
    borderWidth: 1,
    borderColor: '#ff3b30',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  retryText: {
    color: '#ff3b30',
    fontSize: 14,
  },
});
