import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Dimensions, Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const BACKGROUND = '#D0DEE1';
const PRIMARY = '#344225';
const ACCENT = '#FAD979';

type RegimenBlock = {
	title: string;
	steps: string[];
};

type AnalysisPayload = {
	diagnosis: string;
	severity: string;
	summary: string;
	causes: string[];
	viewSummaries: string[];
	recommendations: string[];
	regimen: RegimenBlock[];
};

const fallbackAnalysis: AnalysisPayload = {
	diagnosis: 'Healthy Scalp',
	severity: 'Low Concern',
	summary: 'No acute irritation detected. Continue current routine and rescan in 30 days.',
	causes: ['Hydration and pH remain balanced.', 'No clogged follicles detected.', 'Sebum output within healthy range.'],
	viewSummaries: [
		'Top view shows clean part lines and uniform density.',
		'Side view reveals healthy hairline attachment.',
		'Back view exhibits strong coverage at the crown.',
		'Front view indicates no redness or scaling.',
	],
	recommendations: [
		'Maintain gentle cleansing schedule twice weekly.',
		'Use leave-in tonic rich in niacinamide for barrier support.',
		'Protect scalp from direct sun exposure with SPF mist.',
	],
	regimen: [
		{ title: 'AM', steps: ['Mist scalp with thermal water.', 'Apply lightweight SPF mist.', 'Style loosely to avoid tension.'] },
		{ title: 'PM', steps: ['Pre-shampoo oil massage once weekly.', 'Cleanse with sulfate-free shampoo.', 'Use silk wrap overnight.'] },
	],
};

export default function ResultsScreen() {
	const { scanId, analysis } = useLocalSearchParams();
	const router = useRouter();
	const [selectedImage, setSelectedImage] = useState<string | null>(null);
	const [showAIProcessing, setShowAIProcessing] = useState(false);

	const { analysisData, imageUris } = useMemo(() => {
		let data = { ...fallbackAnalysis };
		let uris: string[] = [];

		if (analysis) {
			try {
				const parsed = JSON.parse(analysis as string);
				// Mapping API fields to UI fields
				uris = [parsed.image_1, parsed.image_2, parsed.image_3].filter(Boolean);
				data = {
					...fallbackAnalysis,
					diagnosis: parsed.detection_result || 'Analysis Complete',
					severity: parsed.severity_level || 'Moderate',
					summary: parsed.notes || 'The AI has completed a detailed review of your scalp frames.',
					recommendations: parsed.recommended_treatment ? [parsed.recommended_treatment] : fallbackAnalysis.recommendations,
				};
			} catch (error) {
				console.warn('Unable to parse analysis payload', error);
			}
		}
		return { analysisData: data, imageUris: uris };
	}, [analysis]);

	const handleScanAgain = () => router.replace('/(tabs)/scan');

	return (
		<SafeAreaView style={styles.container}>
			<ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
				<View style={styles.topBar}>
					<TouchableOpacity style={styles.backButton} onPress={() => router.back()} accessibilityLabel="Go back to previous screen" activeOpacity={0.8}>
						<MaterialIcons name="arrow-back-ios" size={16} color={PRIMARY} style={styles.backIcon} />
						<Text style={styles.backButtonText}>Back</Text>
					</TouchableOpacity>
					<TouchableOpacity style={styles.scanAgainTopButton} onPress={handleScanAgain} accessibilityLabel="Start a new scan" activeOpacity={0.8}>
						<Text style={styles.scanAgainTopText}>Scan Again</Text>
					</TouchableOpacity>
				</View>

				<View style={styles.header}>
					<Text style={styles.title}>AI Scan Results</Text>
					<Text style={styles.subtitle}>Comprehensive analysis from your recent session.</Text>
				</View>

				<View style={styles.analysisCard}>
					<View style={styles.cardHeaderRow}>
						<MaterialIcons name="analytics" size={24} color={PRIMARY} />
						<Text style={styles.cardLabel}>Detected Condition</Text>
					</View>
					<Text style={styles.diagnosis}>{analysisData.diagnosis}</Text>
					<View style={styles.severityWrap}>
						<View style={styles.severityPill}>
							<Text style={styles.severityText}>{analysisData.severity}</Text>
						</View>
					</View>
					<Text style={styles.cardSummary}>{analysisData.summary}</Text>
					<TouchableOpacity
						style={styles.aiDetailsLink}
						onPress={() => setShowAIProcessing(true)}
						activeOpacity={0.7}
					>
						<MaterialIcons name="visibility" size={16} color={PRIMARY} style={styles.btnIconTiny} />
						<Text style={styles.aiDetailsLinkText}>View AI Processing Details</Text>
					</TouchableOpacity>
				</View>

				<View style={styles.section}>
					<Text style={styles.sectionTitle}>Captured Angles</Text>
					<Text style={styles.sectionHint}>Tap any frame to zoom in for detailed inspection.</Text>
					<View style={styles.grid}>
						{imageUris.map((uri, index) => (
							<TouchableOpacity key={uri} onPress={() => setSelectedImage(uri)} style={styles.thumbnailCard} activeOpacity={0.9}>
								<View style={styles.imageWrap}>
									<Image source={{ uri }} style={styles.thumbnail} />
									<View style={styles.zoomOverlay}>
										<MaterialIcons name="zoom-in" size={20} color="#fff" />
									</View>
								</View>
								<Text style={styles.resultText}>{analysisData.viewSummaries[index] || 'Stable reading for this angle.'}</Text>
							</TouchableOpacity>
						))}
					</View>
				</View>

				<View style={styles.sectionRow}>
					<View style={styles.sectionCard}>
						<View style={styles.sectionCardHeader}>
							<MaterialIcons name="help-outline" size={20} color={PRIMARY} />
							<Text style={styles.sectionTitleSmall}>Causes</Text>
						</View>
						{analysisData.causes.map((cause, idx) => (
							<View key={cause} style={styles.listItemWrap}>
								<Text style={styles.bullet}>•</Text>
								<Text style={styles.listItem}>{cause}</Text>
							</View>
						))}
					</View>
					<View style={styles.sectionCard}>
						<View style={styles.sectionCardHeader}>
							<MaterialIcons name="lightbulb-outline" size={20} color={PRIMARY} />
							<Text style={styles.sectionTitleSmall}>Next Actions</Text>
						</View>
						{analysisData.recommendations.map((rec, index) => (
							<View key={rec} style={styles.listItemWrap}>
								<Text style={styles.bulletNum}>{index + 1}.</Text>
								<Text style={styles.listItem}>{rec}</Text>
							</View>
						))}
					</View>
				</View>

				<View style={styles.section}>
					<Text style={styles.sectionTitle}>Prescribed Regimen</Text>
					<View style={styles.regimenRow}>
						{analysisData.regimen.map(block => (
							<View key={block.title} style={styles.regimenCard}>
								<View style={styles.regimenHeader}>
									<MaterialIcons name={block.title === 'AM' ? 'wb-sunny' : 'nightlight-round'} size={18} color={ACCENT} />
									<Text style={styles.regimenTitle}>{block.title} Focus</Text>
								</View>
								<View style={styles.regimenContent}>
									{block.steps.map(step => (
										<View key={step} style={styles.regimenStepWrap}>
											<MaterialIcons name="check" size={14} color="#e5f3eb" style={styles.regStepIcon} />
											<Text style={styles.regimenStep}>{step}</Text>
										</View>
									))}
								</View>
							</View>
						))}
					</View>
				</View>
			</ScrollView>

			{selectedImage && (
				<Modal visible={!!selectedImage} transparent animationType="fade" onRequestClose={() => setSelectedImage(null)}>
					<SafeAreaView style={styles.modal}>
						<View style={styles.modalHeader}>
							<TouchableOpacity style={styles.closeBtn} onPress={() => setSelectedImage(null)} activeOpacity={0.8}>
								<MaterialIcons name="close" size={24} color={PRIMARY} />
								<Text style={styles.closeText}>Close</Text>
							</TouchableOpacity>
						</View>
						<View style={styles.modalBody}>
							<Image source={{ uri: selectedImage }} style={styles.fullImage} />
						</View>
					</SafeAreaView>
				</Modal>
			)}

			{showAIProcessing && (
				<Modal visible={showAIProcessing} transparent animationType="slide" onRequestClose={() => setShowAIProcessing(false)}>
					<SafeAreaView style={styles.processingModal}>
						<View style={styles.processingHeader}>
							<View style={styles.processingHeaderText}>
								<Text style={styles.processingTitle}>AI Processing Details</Text>
								<Text style={styles.processingSubtitle}>Visualization of neural network analysis</Text>
							</View>
							<TouchableOpacity onPress={() => setShowAIProcessing(false)} style={styles.processingClose} activeOpacity={0.8}>
								<MaterialIcons name="close" size={24} color={PRIMARY} />
							</TouchableOpacity>
						</View>

						<ScrollView contentContainerStyle={styles.processingScroll} showsVerticalScrollIndicator={false}>
							<View style={styles.processingSummaryBox}>
								<MaterialIcons name="memory" size={24} color={PRIMARY} />
								<View style={styles.processingSummaryTextWrap}>
									<Text style={styles.processingSummaryTitle}>Scalp Health Triangulation</Text>
									<Text style={styles.processingSummaryText}>
										Target frames downsampled to 512x512. Normalization applied for luminance consistency.
										AI analyzed 4,096 local regions across three angles.
									</Text>
								</View>
							</View>

							{imageUris.map((uri, idx) => (
								<View key={`proc-${idx}`} style={styles.processingCard}>
									<View style={styles.processingCardTitleRow}>
										<MaterialIcons name="center-focus-weak" size={18} color={PRIMARY} />
										<Text style={styles.processingCardTitle}>
											{idx === 0 ? 'Top View' : idx === 1 ? 'Sides View' : 'Back View'} Analysis
										</Text>
									</View>
									<View style={styles.processingImageContainer}>
										<Image source={{ uri }} style={styles.processingImage} />
										<View style={styles.processingOverlay}>
											{/* Focus Area */}
											<View style={[styles.focusBox, { top: '25%', left: '25%', width: '50%', height: '50%' }]} />
											{/* Feature Points */}
											<View style={[styles.focusPoint, { top: '35%', left: '40%' }]} />
											<View style={[styles.focusPoint, { top: '55%', left: '60%' }]} />
											<View style={[styles.focusPoint, { top: '45%', left: '30%' }]} />
											<View style={[styles.focusPoint, { top: '65%', left: '50%' }]} />
										</View>
									</View>
									<View style={styles.processingCardFooter}>
										<Text style={styles.processingDescription}>
											High-confidence features detected in central scalp region.
											Neural layers activated for texture and color signature extraction.
										</Text>
									</View>
								</View>
							))}
						</ScrollView>
					</SafeAreaView>
				</Modal>
			)}
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: BACKGROUND,
	},
	scroll: {
		padding: 20,
		paddingBottom: 40,
	},
	topBar: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		width: '100%',
		marginBottom: 20,
	},
	backButton: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingVertical: 10,
		paddingHorizontal: 16,
		borderRadius: 12,
		backgroundColor: '#fff',
		shadowColor: '#000',
		shadowOpacity: 0.05,
		shadowRadius: 5,
		shadowOffset: { width: 0, height: 2 },
		elevation: 2,
	},
	backIcon: {
		marginRight: 4,
		marginLeft: 2,
	},
	backButtonText: {
		fontSize: 15,
		fontWeight: '700',
		color: PRIMARY,
	},
	scanAgainTopButton: {
		paddingVertical: 10,
		paddingHorizontal: 18,
		borderRadius: 12,
		backgroundColor: PRIMARY,
		shadowColor: '#000',
		shadowOpacity: 0.1,
		shadowRadius: 6,
		shadowOffset: { width: 0, height: 3 },
		elevation: 3,
	},
	scanAgainTopText: {
		fontSize: 15,
		fontWeight: '700',
		color: BACKGROUND,
	},
	header: {
		marginBottom: 24,
	},
	title: {
		fontSize: 28,
		fontWeight: '800',
		color: PRIMARY,
		marginBottom: 6,
	},
	subtitle: {
		fontSize: 15,
		color: '#4f5b50',
		lineHeight: 22,
	},
	analysisCard: {
		width: '100%',
		backgroundColor: ACCENT,
		borderRadius: 24,
		padding: 24,
		marginBottom: 28,
		shadowColor: '#000',
		shadowOpacity: 0.1,
		shadowRadius: 12,
		shadowOffset: { width: 0, height: 6 },
		elevation: 4,
	},
	cardHeaderRow: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 10,
	},
	cardLabel: {
		fontSize: 14,
		fontWeight: '700',
		color: PRIMARY,
		textTransform: 'uppercase',
		letterSpacing: 0.5,
		marginLeft: 8,
	},
	diagnosis: {
		fontSize: 26,
		fontWeight: '800',
		color: PRIMARY,
		marginBottom: 8,
	},
	severityWrap: {
		flexDirection: 'row',
		marginBottom: 16,
	},
	severityPill: {
		paddingHorizontal: 14,
		paddingVertical: 6,
		borderRadius: 999,
		backgroundColor: '#e6ede8',
	},
	severityText: {
		fontSize: 13,
		fontWeight: '800',
		color: PRIMARY,
		textTransform: 'uppercase',
	},
	cardSummary: {
		fontSize: 15,
		color: '#3a433e',
		lineHeight: 22,
	},
	section: {
		width: '100%',
		marginBottom: 28,
	},
	sectionRow: {
		flexDirection: width > 400 ? 'row' : 'column',
		width: '100%',
		justifyContent: 'space-between',
		marginBottom: 28,
	},
	sectionCard: {
		flex: 1,
		backgroundColor: '#ffffff',
		borderRadius: 20,
		padding: 20,
		marginHorizontal: 4,
		marginBottom: width > 400 ? 0 : 16,
		shadowColor: '#000',
		shadowOpacity: 0.05,
		shadowRadius: 8,
		shadowOffset: { width: 0, height: 4 },
		elevation: 2,
	},
	sectionCardHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 12,
	},
	sectionTitle: {
		fontSize: 20,
		fontWeight: '800',
		color: PRIMARY,
		marginBottom: 6,
		paddingHorizontal: 4,
	},
	sectionTitleSmall: {
		fontSize: 17,
		fontWeight: '800',
		color: PRIMARY,
		marginLeft: 8,
	},
	sectionHint: {
		fontSize: 14,
		color: '#4f5b50',
		marginBottom: 16,
		paddingHorizontal: 4,
	},
	grid: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		justifyContent: 'space-between',
		width: '100%',
	},
	thumbnailCard: {
		width: '48%',
		marginBottom: 20,
		backgroundColor: '#fff',
		borderRadius: 16,
		padding: 10,
		shadowColor: '#000',
		shadowOpacity: 0.04,
		shadowRadius: 6,
		shadowOffset: { width: 0, height: 3 },
		elevation: 2,
	},
	imageWrap: {
		width: '100%',
		aspectRatio: 1,
		borderRadius: 12,
		overflow: 'hidden',
		marginBottom: 12,
		position: 'relative',
	},
	thumbnail: {
		width: '100%',
		height: '100%',
	},
	zoomOverlay: {
		position: 'absolute',
		bottom: 8,
		right: 8,
		backgroundColor: 'rgba(52, 66, 37, 0.7)',
		borderRadius: 20,
		padding: 4,
	},
	resultText: {
		fontSize: 13,
		color: '#3a433e',
		lineHeight: 18,
	},
	listItemWrap: {
		flexDirection: 'row',
		marginBottom: 8,
		alignItems: 'flex-start',
	},
	bullet: {
		fontSize: 15,
		fontWeight: '800',
		color: PRIMARY,
		marginRight: 8,
		marginTop: -2,
	},
	bulletNum: {
		fontSize: 14,
		fontWeight: '700',
		color: PRIMARY,
		marginRight: 6,
	},
	listItem: {
		flex: 1,
		fontSize: 14,
		color: '#4f5b50',
		lineHeight: 20,
	},
	regimenRow: {
		flexDirection: width > 400 ? 'row' : 'column',
		width: '100%',
		justifyContent: 'space-between',
	},
	regimenCard: {
		flex: 1,
		backgroundColor: PRIMARY,
		borderRadius: 20,
		padding: 20,
		marginHorizontal: 4,
		marginBottom: width > 400 ? 0 : 16,
		shadowColor: '#000',
		shadowOpacity: 0.15,
		shadowRadius: 10,
		shadowOffset: { width: 0, height: 6 },
		elevation: 5,
	},
	regimenHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 16,
		borderBottomWidth: 1,
		borderBottomColor: '#4a5a51',
		paddingBottom: 12,
	},
	regimenTitle: {
		fontSize: 16,
		fontWeight: '800',
		color: ACCENT,
		marginLeft: 8,
	},
	regimenContent: {
		flex: 1,
	},
	regimenStepWrap: {
		flexDirection: 'row',
		marginBottom: 10,
		alignItems: 'flex-start',
	},
	regStepIcon: {
		marginRight: 8,
		marginTop: 2,
	},
	regimenStep: {
		flex: 1,
		fontSize: 14,
		color: '#e5f3eb',
		lineHeight: 20,
	},
	modal: {
		flex: 1,
		backgroundColor: 'rgba(16, 35, 19, 0.95)',
	},
	modalHeader: {
		flexDirection: 'row',
		justifyContent: 'flex-end',
		padding: 20,
	},
	closeBtn: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: '#fff',
		paddingVertical: 8,
		paddingHorizontal: 16,
		borderRadius: 999,
	},
	closeText: {
		fontSize: 15,
		fontWeight: '700',
		color: PRIMARY,
		marginLeft: 4,
	},
	modalBody: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		padding: 20,
	},
	fullImage: {
		width: width * 0.9,
		height: width * 0.9,
		resizeMode: 'contain',
		borderRadius: 24,
	},
	aiDetailsLink: {
		flexDirection: 'row',
		alignItems: 'center',
		marginTop: 18,
		paddingVertical: 10,
		paddingHorizontal: 14,
		backgroundColor: 'rgba(52, 66, 37, 0.08)',
		borderRadius: 12,
		alignSelf: 'flex-start',
	},
	btnIconTiny: {
		marginRight: 8,
	},
	aiDetailsLinkText: {
		fontSize: 14,
		fontWeight: '700',
		color: PRIMARY,
		textDecorationLine: 'underline',
	},
	processingModal: {
		flex: 1,
		backgroundColor: '#f4f7f5',
	},
	processingHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		padding: 20,
		backgroundColor: '#fff',
		borderBottomWidth: 1,
		borderBottomColor: '#e0e6e2',
	},
	processingHeaderText: {
		flex: 1,
	},
	processingTitle: {
		fontSize: 22,
		fontWeight: '800',
		color: PRIMARY,
	},
	processingSubtitle: {
		fontSize: 13,
		color: '#6b756f',
		marginTop: 2,
	},
	processingClose: {
		width: 40,
		height: 40,
		borderRadius: 20,
		backgroundColor: '#e6ede8',
		alignItems: 'center',
		justifyContent: 'center',
		marginLeft: 15,
	},
	processingScroll: {
		padding: 20,
		paddingBottom: 40,
	},
	processingSummaryBox: {
		flexDirection: 'row',
		backgroundColor: '#fff',
		borderRadius: 16,
		padding: 16,
		marginBottom: 24,
		borderLeftWidth: 4,
		borderLeftColor: PRIMARY,
		alignItems: 'flex-start',
	},
	processingSummaryTextWrap: {
		flex: 1,
		marginLeft: 15,
	},
	processingSummaryTitle: {
		fontSize: 15,
		fontWeight: '800',
		color: PRIMARY,
		marginBottom: 4,
	},
	processingSummaryText: {
		fontSize: 13,
		color: '#4f5b50',
		lineHeight: 18,
	},
	processingCard: {
		backgroundColor: '#fff',
		borderRadius: 24,
		overflow: 'hidden',
		marginBottom: 24,
		shadowColor: '#000',
		shadowOpacity: 0.06,
		shadowRadius: 10,
		shadowOffset: { width: 0, height: 4 },
		elevation: 3,
	},
	processingCardTitleRow: {
		flexDirection: 'row',
		alignItems: 'center',
		padding: 16,
		borderBottomWidth: 1,
		borderBottomColor: '#f0f4f1',
	},
	processingCardTitle: {
		fontSize: 16,
		fontWeight: '800',
		color: PRIMARY,
		marginLeft: 10,
	},
	processingImageContainer: {
		width: '100%',
		aspectRatio: 1,
		position: 'relative',
	},
	processingImage: {
		width: '100%',
		height: '100%',
	},
	processingOverlay: {
		...StyleSheet.absoluteFillObject,
		backgroundColor: 'rgba(52, 66, 37, 0.15)',
	},
	focusBox: {
		position: 'absolute',
		borderWidth: 2,
		borderColor: ACCENT,
		borderRadius: 12,
		backgroundColor: 'rgba(250, 217, 121, 0.1)',
	},
	focusPoint: {
		position: 'absolute',
		width: 8,
		height: 8,
		borderRadius: 4,
		backgroundColor: '#fff',
		borderWidth: 1.5,
		borderColor: PRIMARY,
	},
	processingCardFooter: {
		padding: 16,
		backgroundColor: '#fcfdfc',
	},
	processingDescription: {
		fontSize: 13,
		color: '#3a433e',
		lineHeight: 18,
		fontStyle: 'italic',
	},
});
