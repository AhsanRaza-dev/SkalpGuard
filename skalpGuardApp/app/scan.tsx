import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImageManipulator from 'expo-image-manipulator';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api } from './api/client';


const BACKGROUND = '#D0DEE1';
const PRIMARY = '#344225';
const ACCENT = '#FAD979';

const captureSteps = [
  { title: 'Top View', hint: 'Hold the camera above the crown for an overhead look.', icon: 'vertical-align-top' as const },
  { title: 'Sides View', hint: 'Angle the camera to capture temple and sides.', icon: 'compare-arrows' as const },
  { title: 'Back View', hint: 'Ask for help or use a mirror to frame the back.', icon: 'vertical-align-bottom' as const },
];

const captureGuidanceMessage = [
  'Use bright, even lighting and avoid harsh shadows.',
  'Hold the camera 6-8 inches from the scalp and keep it steady.',
  'Clean the lens and ensure strands stay in sharp focus.',
  'Fill the frame with the target area and minimize glare.',
]
  .map(line => `• ${line}`)
  .join('\n');

type CaptureSlots = (string | null)[];

const mockResult = {
  diagnosis: 'Likely Seborrheic Dermatitis',
  severity: 'Moderate',
  summary:
    'Scaling and mild redness detected across the crown and temples. Follicles show signs of congestion that can lead to thinning if left untreated.',
  causes: [
    'Excess sebum production combined with Malassezia yeast overgrowth.',
    'Occlusive styling products trapping heat and sweat against the scalp.',
    'High stress levels increasing inflammatory response around follicles.',
  ],
  viewSummaries: [
    'Top view shows diffuse scaling with mild erythema.',
    'Side views highlight patchy dandruff near the temples.',
    'Back view reveals slight follicular congestion.',
  ],
  recommendations: [
    'Cleanse with a salicylic-acid scalp exfoliant twice weekly.',
    'Use a lightweight peptide serum nightly to calm inflammation.',
    'Schedule a follow-up scan after 14 days to measure progress.',
  ],
  regimen: [
    { title: 'AM', steps: ['Rinse scalp with lukewarm water.', 'Apply antifungal foam to flare-ups.', 'Finish with SPF on exposed areas.'] },
    { title: 'PM', steps: ['Massage in peptide serum for 2 minutes.', 'Use blue-light brush for 5 minutes.', 'Sleep on breathable silk pillowcase.'] },
  ],
};

export default function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const router = useRouter();
  const cameraRef = useRef<CameraView | null>(null);
  const [cameraVisible, setCameraVisible] = useState(false);
  const [activeSlot, setActiveSlot] = useState<number | null>(null);
  const [captures, setCaptures] = useState<CaptureSlots>(Array(3).fill(null));
  const [cameraFacing, setCameraFacing] = useState<'front' | 'back'>('back');
  const [analyzing, setAnalyzing] = useState(false);

  const resetSession = useCallback(() => {
    setCaptures(Array(3).fill(null));
    setActiveSlot(null);
    setCameraVisible(false);
    setCameraFacing('back');
    setGuidanceVisible(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      resetSession();
      return undefined;
    }, [resetSession])
  );

  useEffect(() => {
    if (!permission) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  const [guidanceVisible, setGuidanceVisible] = useState(false);
  const [guidanceSlot, setGuidanceSlot] = useState<number | null>(null);

  const openCamera = async (index: number) => {
    if (!permission || !permission.granted) {
      const response = await requestPermission();
      if (!response?.granted) {
        Alert.alert('Permission needed', 'Camera access is required to capture images.');
        return;
      }
    }
    setActiveSlot(index);
    setCameraVisible(true);
    setGuidanceVisible(false);
  };

  const showCaptureGuidance = (index: number) => {
    setGuidanceSlot(index);
    setGuidanceVisible(true);
  };

  const closeCamera = () => {
    setCameraVisible(false);
    setActiveSlot(null);
  };

  const handleCapture = async () => {
    if (!cameraRef.current || activeSlot === null) {
      return;
    }
    try {
      const photo = await cameraRef.current.takePictureAsync();
      const processed = await ImageManipulator.manipulateAsync(
        photo.uri,
        [{ resize: { width: 512, height: 512 } }],
        { compress: 0.85, format: ImageManipulator.SaveFormat.JPEG }
      );
      const next = [...captures];
      next[activeSlot] = processed.uri;
      setCaptures(next);
      closeCamera();
    } catch (error) {
      Alert.alert('Capture failed', 'Could not capture this view. Please try again.');
    }
  };

  const readyForResults = captures.every(Boolean);

  const analysisOptions = {
    results: [
      'Early-stage follicular miniaturization detected in the crown area.',
      'Mild sebum buildup and scaling observed across the frontal scalp.',
      'Healthy follicle density with slight redness in the occipital region.',
      'Noticeable thinning with signs of telogen effluvium.',
      'Active follicular congestion with significant dandruff coverage.',
    ],
    treatments: [
      'Use a 5% Minoxidil solution twice daily and incorporate a scalp massage.',
      'Switch to a Ketoconazole-based shampoo and avoid heavy petroleum products.',
      'Introduce a peptide-rich serum and use a soft-bristle scalp brush.',
      'Apply a clarifying charcoal mask once weekly to clear oil plugs.',
      'Maintain current routine but increase hydration and reduce thermal styling.',
    ],
    severities: ['Low', 'Medium', 'High', 'Critical'],
  };

  const getRandom = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

  const handleShowResults = async () => {
    if (!readyForResults) {
      return;
    }

    setAnalyzing(true);
    try {
      const currentRaw = await AsyncStorage.getItem('current_user');
      if (!currentRaw) {
        Alert.alert('Session Error', 'Please log in again to save your scan.');
        router.replace('/auth');
        return;
      }
      const currentUser = JSON.parse(currentRaw);

      const formData = new FormData();
      formData.append('user_id', currentUser.id.toString());

      // Randomly generated AI Analysis
      formData.append('detection_result', getRandom(analysisOptions.results));
      formData.append('recommended_treatment', getRandom(analysisOptions.treatments));
      formData.append('severity_level', getRandom(analysisOptions.severities));
      formData.append('notes', 'AI-generated analysis based on three-point multi-angle scan.');

      captures.forEach((uri, idx) => {
        if (uri) {
          const filename = uri.split('/').pop() || `scan_${idx + 1}.jpg`;
          const match = /\.(\w+)$/.exec(filename);
          const type = match ? `image/${match[1]}` : `image/jpeg`;

          formData.append(`image_${idx + 1}`, {
            uri,
            name: filename,
            type,
          } as any);
        }
      });

      const response = await api.post('/scans', formData, true);

      if (response.success) {
        router.push({
          pathname: '/(tabs)/results',
          params: {
            scanId: response.data.id.toString(),
            analysis: JSON.stringify(response.data),
          },
        });
      } else {
        Alert.alert('Analysis Failed', response.message || 'We could not process your scans.');
      }
    } catch (error: any) {
      console.error('Scan upload error:', error);
      Alert.alert('Network Error', error?.message || 'Failed to upload scans. Please check your connection.');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.heading}>SkalpGuard Scan</Text>
          <Text style={styles.subheading}>Capture three precise angles so our on-device AI can triangulate scalp health and detect issues.</Text>
        </View>

        <View style={styles.guideCard}>
          <MaterialIcons name="info-outline" size={24} color={PRIMARY} style={styles.guideIcon} />
          <Text style={styles.guideText}>Please remove hats or clips. Ensure good lighting and keep the camera steady for the best AI analysis.</Text>
        </View>

        <View style={styles.grid}>
          {captureSteps.map((step, index) => {
            const hasImage = Boolean(captures[index]);
            return (
              <View key={step.title} style={styles.card}>
                <View style={[styles.cardPreview, hasImage && styles.cardPreviewHasImage]}>
                  {hasImage ? (
                    <Image source={{ uri: captures[index] ?? undefined }} style={styles.cardImage} />
                  ) : (
                    <View style={styles.placeholder}>
                      <MaterialIcons name={step.icon} size={32} color="#9ca9a1" />
                      <Text style={styles.placeholderLabel}>{step.title}</Text>
                      <Text style={styles.placeholderHint}>Tap to capture</Text>
                    </View>
                  )}
                </View>
                <View style={styles.cardContent}>
                  <Text style={styles.cardTitle}>{step.title}</Text>
                  <Text style={styles.cardHint}>{step.hint}</Text>
                  <TouchableOpacity
                    style={[styles.cardButton, hasImage && styles.cardButtonRetake]}
                    onPress={() => showCaptureGuidance(index)}
                    activeOpacity={0.8}
                  >
                    <MaterialIcons
                      name={hasImage ? "refresh" : "camera-alt"}
                      size={18}
                      color={hasImage ? PRIMARY : BACKGROUND}
                      style={styles.btnIconSmall}
                    />
                    <Text style={[styles.cardButtonText, hasImage && styles.cardButtonTextRetake]}>
                      {hasImage ? 'Retake' : 'Capture'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>

        <TouchableOpacity
          style={[styles.resultsButton, !readyForResults && styles.resultsButtonDisabled]}
          onPress={handleShowResults}
          disabled={!readyForResults}
          activeOpacity={0.8}
        >
          {analyzing ? (
            <ActivityIndicator color={BACKGROUND} />
          ) : (
            <>
              {readyForResults && <MaterialIcons name="auto-awesome" size={20} color={BACKGROUND} style={styles.btnIcon} />}
              <Text style={[styles.resultsButtonText, !readyForResults && styles.resultsButtonTextDisabled]}>
                {readyForResults ? 'Analyze Scans with AI' : 'Complete All Scans First'}
              </Text>
            </>
          )}
        </TouchableOpacity>

      </ScrollView>

      <Modal visible={cameraVisible} animationType="slide" onRequestClose={closeCamera}>
        <SafeAreaView style={styles.cameraShell}>
          <View style={styles.cameraHeader}>
            <Text style={styles.cameraTitle}>{activeSlot !== null ? captureSteps[activeSlot].title : 'Capture'}</Text>
            <Text style={styles.cameraHint}>Align the scalp inside the frame and tap capture.</Text>
          </View>
          <CameraView style={styles.cameraView} ref={cameraRef} facing={cameraFacing}>
            <View style={styles.cameraOverlay} />
          </CameraView>
          <View style={styles.cameraControls}>
            <TouchableOpacity style={[styles.cameraButton, styles.cameraButtonGhost]} onPress={closeCamera}>
              <Text style={styles.cameraButtonTextGhost}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cameraButton} onPress={handleCapture}>
              <Text style={styles.cameraButtonText}>Capture</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cameraIconButton}
              onPress={() => setCameraFacing(prev => (prev === 'back' ? 'front' : 'back'))}
              accessibilityLabel="Flip camera"
            >
              <MaterialIcons name="flip-camera-ios" size={24} color={BACKGROUND} />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      <Modal visible={guidanceVisible} transparent animationType="fade" onRequestClose={() => setGuidanceVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.guidanceCard}>
            <View style={styles.guidanceHeader}>
              <MaterialIcons name="fact-check" size={28} color={PRIMARY} />
              <Text style={styles.guidanceTitle}>Capture Checklist</Text>
            </View>
            <View style={styles.guidanceContent}>
              {[
                'Use bright, even lighting and avoid harsh shadows.',
                'Hold the camera 6-8 inches from the scalp and keep it steady.',
                'Clean the lens and ensure strands stay in sharp focus.',
                'Fill the frame with the target area and minimize glare.',
              ].map((line, idx) => (
                <View key={idx} style={styles.guidanceListItem}>
                  <MaterialIcons name="check-circle" size={18} color={PRIMARY} style={styles.guidanceListIcon} />
                  <Text style={styles.guidanceListText}>{line}</Text>
                </View>
              ))}
            </View>
            <View style={styles.guidanceActions}>
              <TouchableOpacity style={styles.guidanceBtnCancel} onPress={() => setGuidanceVisible(false)} activeOpacity={0.7}>
                <Text style={styles.guidanceBtnCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.guidanceBtnReady}
                onPress={() => {
                  if (guidanceSlot !== null) {
                    openCamera(guidanceSlot);
                  }
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.guidanceBtnReadyText}>I'm Ready</Text>
                <MaterialIcons name="arrow-forward" size={18} color={BACKGROUND} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BACKGROUND,
  },
  content: {
    padding: 20,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 20,
  },
  heading: {
    fontSize: 28,
    fontWeight: '800',
    color: PRIMARY,
    marginBottom: 6,
  },
  subheading: {
    fontSize: 15,
    color: '#4f5b50',
    lineHeight: 22,
  },
  guideCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  guideIcon: {
    marginRight: 12,
  },
  guideText: {
    flex: 1,
    fontSize: 13,
    color: '#3a433e',
    lineHeight: 18,
  },
  grid: {
    marginBottom: 10,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 10,
    elevation: 3,
    alignItems: 'center',
  },
  cardPreview: {
    width: 110,
    height: 110,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#e6ede8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  cardPreviewHasImage: {
    backgroundColor: PRIMARY,
    borderWidth: 2,
    borderColor: ACCENT,
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderLabel: {
    fontWeight: '700',
    fontSize: 14,
    color: '#6b756f',
    marginTop: 8,
  },
  placeholderHint: {
    fontSize: 11,
    color: '#9ca9a1',
    marginTop: 2,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontWeight: '800',
    fontSize: 18,
    marginBottom: 6,
    color: PRIMARY,
  },
  cardHint: {
    fontSize: 13,
    color: '#6b756f',
    lineHeight: 18,
    marginBottom: 12,
  },
  cardButton: {
    flexDirection: 'row',
    height: 40,
    borderRadius: 10,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardButtonRetake: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#9ca9a1',
  },
  btnIconSmall: {
    marginRight: 6,
  },
  cardButtonText: {
    color: BACKGROUND,
    fontWeight: '700',
    fontSize: 14,
  },
  cardButtonTextRetake: {
    color: PRIMARY,
  },
  resultsButton: {
    height: 56,
    borderRadius: 16,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    flexDirection: 'row',
  },
  btnIcon: {
    marginRight: 10,
  },
  resultsButtonDisabled: {
    backgroundColor: '#9ca9a1',
  },
  resultsButtonText: {
    color: BACKGROUND,
    fontSize: 16,
    fontWeight: '700',
  },
  resultsButtonTextDisabled: {
    color: '#e6ede8',
    opacity: 0.8,
  },
  cameraShell: {
    flex: 1,
    backgroundColor: '#000',
  },
  cameraHeader: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  cameraTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
  },
  cameraHint: {
    fontSize: 14,
    color: '#d7d7d7',
    marginTop: 6,
  },
  cameraView: {
    flex: 1,
  },
  cameraOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 2,
    borderColor: 'rgba(212,232,224,0.65)',
    borderRadius: 24,
    margin: 20,
  },
  cameraControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 24,
    backgroundColor: '#111',
  },
  cameraButton: {
    flex: 1,
    height: 56,
    borderRadius: 16,
    backgroundColor: ACCENT,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  cameraButtonGhost: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#6b756f',
    marginLeft: 0,
    marginRight: 12,
  },
  cameraButtonTextGhost: {
    fontSize: 16,
    fontWeight: '700',
    color: BACKGROUND,
  },
  cameraIconButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  cameraButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: PRIMARY,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(52, 66, 37, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  guidanceCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  guidanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  guidanceTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: PRIMARY,
    marginLeft: 10,
  },
  guidanceContent: {
    marginBottom: 24,
  },
  guidanceListItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  guidanceListIcon: {
    marginTop: 2,
    marginRight: 10,
  },
  guidanceListText: {
    flex: 1,
    fontSize: 15,
    color: '#4f5b50',
    lineHeight: 22,
  },
  guidanceActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  guidanceBtnCancel: {
    flex: 1,
    height: 50,
    borderRadius: 14,
    backgroundColor: '#e6ede8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  guidanceBtnCancelText: {
    color: PRIMARY,
    fontSize: 16,
    fontWeight: '700',
  },
  guidanceBtnReady: {
    flex: 1.5,
    height: 50,
    borderRadius: 14,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  guidanceBtnReadyText: {
    color: BACKGROUND,
    fontSize: 16,
    fontWeight: '700',
    marginRight: 6,
  },
});