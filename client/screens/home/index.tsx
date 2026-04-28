import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useState, useRef, useCallback, useEffect } from 'react';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system/legacy';
import { Screen } from '@/components/Screen';
import { RNSSE } from 'react-native-sse';

interface Message {
  id: number;
  question: string;
  answer: string;
}

export default function HomePage() {
  const [isRecording, setIsRecording] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordingStatus, setRecordingStatus] = useState<string>('ready');
  const [currentQuestion, setCurrentQuestion] = useState<string>('');
  const [currentAnswer, setCurrentAnswer] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const recordingRef = useRef<Audio.Recording | null>(null);
  const messageIdRef = useRef(0);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Audio.requestPermissionsAsync();
        setHasPermission(status === 'granted');
      } catch (error) {
        console.error('Permission error:', error);
      }
    })();
  }, []);

  const startRecording = async () => {
    console.log('Starting recording...');
    setRecordingStatus('requesting');
    
    try {
      if (!hasPermission) {
        setRecordingStatus('requesting_permission');
        const { status } = await Audio.requestPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('需要权限', '请授予麦克风权限');
          setRecordingStatus('permission_denied');
          return;
        }
        setHasPermission(true);
      }

      if (recordingRef.current) {
        await recordingRef.current.stopAndUnloadAsync();
        recordingRef.current = null;
      }

      setRecordingStatus('preparing');
      await Audio.setAudioModeAsync({ 
        allowsRecordingIOS: true, 
        playsInSilentModeIOS: true,
      });

      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      await recording.startAsync();
      
      recordingRef.current = recording;
      setIsRecording(true);
      setRecordingStatus('recording');
      setCurrentQuestion('');
      setCurrentAnswer('');
      
      console.log('Recording started');
      
    } catch (error: any) {
      console.error('录音失败:', error);
      setRecordingStatus('error');
      Alert.alert('录音失败', error.message || '请在真机上测试');
    }
  };

  const stopRecording = async () => {
    console.log('Stopping recording...');
    if (!recordingRef.current) return;

    try {
      setRecordingStatus('stopping');
      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();
      recordingRef.current = null;
      setIsRecording(false);
      setIsProcessing(true);
      setRecordingStatus('processing');

      if (uri) {
        await processAudioStream(uri);
      } else {
        Alert.alert('错误', '录音文件无效');
        setIsProcessing(false);
        setRecordingStatus('ready');
      }
    } catch (error: any) {
      console.error('停止录音失败:', error);
      setIsRecording(false);
      setIsProcessing(false);
      setRecordingStatus('error');
    }
  };

  const processAudioStream = async (audioUri: string) => {
    try {
      const base64Audio = await (FileSystem as any).readAsStringAsync(audioUri, {
        encoding: (FileSystem as any).EncodingType.Base64,
      });

      const url = `${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/chat/stream`;
      
      const sse = new RNSSE(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ audio: base64Audio }),
      });

      sse.addEventListener('message', (event: any) => {
        if (!event.data) return;
        
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'question') {
            setCurrentQuestion(data.content);
          } else if (data.type === 'answer') {
            setCurrentAnswer(prev => prev + data.content);
          } else if (data.type === 'done') {
            // Save to history
            if (currentQuestion && currentAnswer) {
              messageIdRef.current += 1;
              setMessages(prev => [...prev, {
                id: messageIdRef.current,
                question: currentQuestion,
                answer: currentAnswer,
              }]);
            }
            setIsProcessing(false);
            setRecordingStatus('ready');
            sse.close();
          } else if (data.type === 'error') {
            Alert.alert('错误', data.message);
            setIsProcessing(false);
            setRecordingStatus('ready');
            sse.close();
          }
        } catch (e) {
          console.error('Parse error:', e);
        }
      });

      sse.addEventListener('error', (error: any) => {
        console.error('SSE error:', error);
        Alert.alert('错误', '连接失败');
        setIsProcessing(false);
        setRecordingStatus('ready');
      });

    } catch (error: any) {
      console.error('处理音频失败:', error);
      Alert.alert('错误', '处理失败');
      setIsProcessing(false);
      setRecordingStatus('ready');
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <Screen statusBarStyle="light">
      <View className="flex-1 bg-gray-950">
        {/* Header */}
        <View className="pt-12 pb-4 px-6">
          <Text className="text-xl font-bold text-white text-center">泰州学院</Text>
          <Text className="text-base text-cyan-400 text-center mt-1">Computer Science & Technology</Text>
          <Text className="text-xs text-gray-500 text-center mt-1">ASIIN 认证座谈 | 支持中英文提问</Text>
        </View>

        {/* Topic Tags */}
        <View className="px-4 mb-4">
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row gap-2">
              {['教育目标', '课程设置', '教学内容', '学生支持', '考试组织', '学习成果', '就业市场', '学生流动'].map((topic) => (
                <View key={topic} className="px-3 py-1 bg-gray-800 rounded-full border border-cyan-500/30">
                  <Text className="text-xs text-cyan-400">{topic}</Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Recording Button */}
        <View className="items-center justify-center py-6">
          <TouchableOpacity
            onPress={toggleRecording}
            disabled={isProcessing}
            className={`w-28 h-28 rounded-full items-center justify-center ${
              isRecording ? 'bg-red-600 border-4 border-red-400' : 'bg-cyan-500 border-4 border-cyan-300'
            }`}
            style={{
              shadowColor: isRecording ? '#ef4444' : '#00f0ff',
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.8,
              shadowRadius: 20,
            }}
          >
            {isProcessing ? (
              <ActivityIndicator size="large" color="#ffffff" />
            ) : (
              <View className={`w-8 h-8 rounded-full ${isRecording ? 'bg-white' : 'bg-cyan-600'}`} />
            )}
          </TouchableOpacity>
          <Text className="text-white mt-4 text-lg font-medium">
            {isProcessing ? '生成回答中...' : isRecording ? '点击停止' : '点击录音'}
          </Text>
          <Text className="text-gray-500 text-sm mt-1">请用中文或英文提问</Text>
          
          <View className="mt-3 px-4 py-2 bg-gray-900/50 rounded-lg">
            <Text className="text-xs text-gray-400">
              状态: {
                recordingStatus === 'recording' ? '正在录音' :
                recordingStatus === 'processing' ? '生成回答...' :
                recordingStatus === 'requesting_permission' ? '请求权限...' :
                '就绪'
              }
            </Text>
          </View>
        </View>

        {/* Current Answer */}
        {currentQuestion && (
          <View className="mx-4 mb-3 p-4 bg-gray-900 rounded-xl border border-cyan-500/30">
            <Text className="text-gray-400 text-xs mb-2">识别的问题</Text>
            <Text className="text-white text-base">{currentQuestion}</Text>
          </View>
        )}

        {currentAnswer && (
          <View className="mx-4 mb-4 p-4 bg-gray-900 rounded-xl border border-emerald-500/30">
            <View className="flex-row items-center mb-2">
              <View className="w-2 h-2 bg-emerald-400 rounded-full mr-2" />
              <Text className="text-emerald-400 text-xs font-medium">回答</Text>
            </View>
            <Text className="text-white text-base leading-relaxed">{currentAnswer}</Text>
          </View>
        )}

        {/* History */}
        {messages.length > 0 && (
          <View className="px-4 pb-6">
            <Text className="text-gray-500 text-xs mb-3">历史记录 ({messages.length})</Text>
            <ScrollView className="max-h-48">
              {messages.map(msg => (
                <View key={msg.id} className="mb-3 p-3 bg-gray-900/50 rounded-lg border border-gray-800">
                  <Text className="text-gray-400 text-xs mb-1">Q: {msg.question}</Text>
                  <Text className="text-white text-sm mt-1" numberOfLines={4}>{msg.answer}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        )}
      </View>
    </Screen>
  );
}
