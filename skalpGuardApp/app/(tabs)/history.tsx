import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useMemo, useState } from 'react';
import {
	ActivityIndicator,
	Image,
	Modal,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api } from '../api/client';

type HistoryEntry = {
	id: string | number;
	detection_date: string;
	detection_time: string;
	detection_result: string;
	severity_level: 'Low' | 'Medium' | 'High' | 'Critical';
	notes: string;
	recommended_treatment: string;
	image_1?: string;
	image_2?: string;
	image_3?: string;
	score?: number; // Derived for graph
};

const BACKGROUND = '#D0DEE1';
const PRIMARY = '#344225';
const ACCENT = '#FAD979';
const MUTED = '#4f5b50';



export default function HistoryScreen() {
	const [entries, setEntries] = useState<HistoryEntry[]>([]);
	const [userEmail, setUserEmail] = useState('');
	const [isLoading, setIsLoading] = useState(true);
	const [progressVisible, setProgressVisible] = useState(false);

	const loadHistory = useCallback(async () => {
		setIsLoading(true);
		try {
			const currentRaw = await AsyncStorage.getItem('current_user');
			if (!currentRaw) {
				setIsLoading(false);
				return;
			}

			const currentUser = JSON.parse(currentRaw);
			setUserEmail(currentUser.email || currentUser.displayName || '');

			const response = await api.get(`/users/${currentUser.id}/scans`);

			if (response.success && Array.isArray(response.data)) {
				// Map severity to a numeric score for the graph (0-100)
				const severityScoreMap: Record<string, number> = {
					Low: 92,
					Medium: 65,
					High: 35,
					Critical: 15,
				};

				const mappedData = response.data.map((item: any) => ({
					...item,
					score: severityScoreMap[item.severity_level] || 50,
				}));
				setEntries(mappedData);
			}
		} catch (error) {
			console.error('Failed to load history:', error);
		} finally {
			setIsLoading(false);
		}
	}, []);

	useFocusEffect(
		useCallback(() => {
			loadHistory();
		}, [loadHistory])
	);

	const formatter = useMemo(
		() =>
			new Intl.DateTimeFormat('en-US', {
				weekday: 'short',
				month: 'short',
				day: 'numeric',
				hour: 'numeric',
				minute: '2-digit',
			}),
		[]
	);

	const parseDate = (d?: string, t?: string) => {
		if (!d) return new Date();
		const str = t ? `${d}T${t}` : d;
		const parsed = new Date(str);
		return isNaN(parsed.getTime()) ? new Date() : parsed;
	};

	const progressSeries = useMemo(() => {
		return entries
			.slice()
			.sort((a, b) => parseDate(a.detection_date, a.detection_time).getTime() - parseDate(b.detection_date, b.detection_time).getTime())
			.map(entry => {
				const d = parseDate(entry.detection_date, entry.detection_time);
				return {
					id: entry.id,
					label: new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(d),
					score: entry.score || 0,
					severity: entry.severity_level,
					diagnosis: entry.detection_result,
				};
			});
	}, [entries]);

	const maxScore = Math.max(...progressSeries.map(point => point.score), 100);

	const getSeverityStyle = (severity: HistoryEntry['severity_level']) => {
		const severityMap: Record<HistoryEntry['severity_level'], any> = {
			Low: styles.severityLow,
			Medium: styles.severityModerate,
			High: styles.severityMild, // High is yellow-ish in our styles currently, let's keep it close
			Critical: styles.severitySevere,
		};
		return severityMap[severity] || styles.severityPill;
	};

	const renderCard = ({ item }: { item: HistoryEntry }) => (
		<View style={styles.card}>
			<View style={styles.cardHeader}>
				<View style={{ flex: 1 }}>
					<Text style={styles.cardTitle}>{item.detection_result}</Text>
				</View>
				<View style={[styles.severityPill, getSeverityStyle(item.severity_level)]}>
					<Text style={styles.severityText}>{item.severity_level}</Text>
				</View>
			</View>
			<View style={styles.metaRow}>
				<MaterialIcons name="calendar-today" size={14} color={PRIMARY} style={styles.metaIcon} />
				<Text style={styles.metaText}>
					{formatter.format(parseDate(item.detection_date, item.detection_time))}
				</Text>
			</View>
			{item.notes && <Text style={styles.description}>{item.notes}</Text>}
			<View style={styles.divider} />
			<View style={styles.routineHeader}>
				<MaterialIcons name="lightbulb-outline" size={16} color={PRIMARY} />
				<Text style={styles.routineLabel}>AI Recommendation</Text>
			</View>
			<Text style={styles.routineText}>{item.recommended_treatment}</Text>

			{(item.image_1 || item.image_2 || item.image_3) && (
				<View style={styles.imageSection}>
					<Text style={styles.imageLabel}>Multi-Angle Scans</Text>
					<ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.imageScroll}>
						{[item.image_1, item.image_2, item.image_3].map((uri, index) => (
							uri ? (
								<TouchableOpacity key={index} activeOpacity={0.9} style={styles.scanImageWrapper}>
									<Image source={{ uri }} style={styles.scanImage} />
									<View style={styles.imageBadge}>
										<Text style={styles.imageBadgeText}>V{index + 1}</Text>
									</View>
								</TouchableOpacity>
							) : null
						))}
					</ScrollView>
				</View>
			)}
		</View>
	);

	return (
		<SafeAreaView style={styles.safeArea}>
			<View style={styles.page}>
				<ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
					<View style={styles.topHeader}>
						<TouchableOpacity style={styles.progressIconButton} onPress={() => setProgressVisible(true)} activeOpacity={0.8}>
							<MaterialIcons name="bar-chart" size={24} color={PRIMARY} />
						</TouchableOpacity>
						<View style={styles.headerBlock}>
							<Text style={styles.screenTitle}>Scan History</Text>
							<Text style={styles.screenSubtitle}>
								{userEmail ? `Signed in as ${userEmail}` : 'Signed in user history preview'}
							</Text>
						</View>
					</View>

					{!isLoading && entries.length ? (
						entries.map(entry => <View key={entry.id}>{renderCard({ item: entry })}</View>)
					) : !isLoading ? (
						<Text style={styles.emptyText}>No scans recorded yet.</Text>
					) : null}
				</ScrollView>
			</View>

			<Modal visible={progressVisible} transparent animationType="fade" onRequestClose={() => setProgressVisible(false)}>
				<View style={styles.modalBackdrop}>
					<View style={styles.modalCard}>
						<View style={styles.modalHeader}>
							<Text style={styles.modalTitle}>Progress Overview</Text>
							<TouchableOpacity onPress={() => setProgressVisible(false)} activeOpacity={0.7} style={styles.closeBtn}>
								<MaterialIcons name="close" size={22} color={PRIMARY} />
							</TouchableOpacity>
						</View>

						{progressSeries.length ? (
							<>
								<View style={styles.graphLegend}>
									<Text style={styles.legendTitle}>Latest Scalp Score</Text>
									<Text style={styles.legendValue}>{progressSeries[progressSeries.length - 1]?.score}<Text style={styles.legendValueMax}>/100</Text></Text>
								</View>

								<View style={styles.graph}>
									{progressSeries.map(point => (
										<View key={point.id} style={styles.graphColumn}>
											<View style={styles.graphBarTrack}>
												<View
													style={[
														styles.graphBar,
														{ height: `${(point.score / maxScore) * 100}%` },
													]}
												/>
											</View>
											<Text style={styles.graphScore}>{point.score}</Text>
											<Text style={styles.graphLabel}>{point.label}</Text>
										</View>
									))}
								</View>

								<View style={styles.progressList}>
									{progressSeries.map(point => (
										<View key={`${point.id}-detail`} style={styles.progressRow}>
											<View style={styles.progressRowMeta}>
												<Text style={styles.progressRowLabel}>{point.label}</Text>
												<View style={[styles.smSeverityPill, getSeverityStyle(point.severity)]}>
													<Text style={styles.smSeverityText}>{point.severity}</Text>
												</View>
											</View>
											<Text style={styles.progressRowDiagnosis}>{point.diagnosis}</Text>
										</View>
									))}
								</View>
							</>
						) : (
							<Text style={styles.emptyText}>No progress data yet.</Text>
						)}
					</View>
				</View>
			</Modal>

			<Modal visible={isLoading} transparent animationType="fade">
				<View style={styles.loadingModalOverlay}>
					<View style={styles.loadingAlert}>
						<ActivityIndicator size="large" color={PRIMARY} />
						<Text style={styles.loadingAlertText}>Fetching your scans...</Text>
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
	page: {
		flex: 1,
	},
	topHeader: {
		flexDirection: 'row',
		alignItems: 'flex-start',
		paddingTop: 12,
		paddingBottom: 16,
	},
	progressIconButton: {
		width: 48,
		height: 48,
		borderRadius: 24,
		backgroundColor: '#fff',
		alignItems: 'center',
		justifyContent: 'center',
		marginRight: 16,
		shadowColor: '#000',
		shadowOpacity: 0.08,
		shadowRadius: 10,
		shadowOffset: { width: 0, height: 4 },
		elevation: 3,
	},
	headerBlock: {
		flex: 1,
		justifyContent: 'center',
	},
	screenTitle: {
		fontSize: 26,
		fontWeight: '800',
		color: PRIMARY,
	},
	screenSubtitle: {
		fontSize: 14,
		color: MUTED,
		marginTop: 4,
	},
	scrollContent: {
		padding: 20,
		paddingTop: 0,
		paddingBottom: 40,
	},
	card: {
		backgroundColor: '#fff',
		borderRadius: 24,
		padding: 20,
		marginBottom: 16,
		shadowColor: '#000',
		shadowOpacity: 0.06,
		shadowRadius: 12,
		shadowOffset: { width: 0, height: 6 },
		elevation: 4,
	},
	cardHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		marginBottom: 10,
	},
	cardTitle: {
		fontSize: 18,
		fontWeight: '800',
		color: PRIMARY,
		flex: 1,
	},
	severityPill: {
		paddingHorizontal: 12,
		paddingVertical: 6,
		borderRadius: 999,
		backgroundColor: '#e6ede8',
		marginLeft: 10,
	},
	severityText: {
		fontSize: 12,
		fontWeight: '800',
		color: PRIMARY,
		textTransform: 'uppercase',
	},
	severityLow: {
		backgroundColor: '#d4f5dc',
	},
	severityMild: {
		backgroundColor: '#fdf0d5',
	},
	severityModerate: {
		backgroundColor: '#fde0c2',
	},
	severitySevere: {
		backgroundColor: '#f8c0c0',
	},
	metaRow: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 12,
	},
	metaIcon: {
		marginRight: 6,
	},
	metaText: {
		fontSize: 13,
		fontWeight: '600',
		color: PRIMARY,
	},
	description: {
		fontSize: 14,
		color: '#4f5b50',
		lineHeight: 22,
	},
	divider: {
		height: 1,
		backgroundColor: '#e6ede8',
		marginVertical: 16,
	},
	routineHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 6,
	},
	routineLabel: {
		fontSize: 14,
		fontWeight: '800',
		color: PRIMARY,
		marginLeft: 6,
	},
	routineText: {
		fontSize: 14,
		color: '#3a433e',
		lineHeight: 20,
	},
	emptyText: {
		textAlign: 'center',
		color: MUTED,
		marginTop: 40,
		fontSize: 15,
	},
	modalBackdrop: {
		flex: 1,
		backgroundColor: 'rgba(52, 66, 37, 0.5)',
		justifyContent: 'center',
		alignItems: 'center',
		padding: 20,
	},
	modalCard: {
		width: '100%',
		backgroundColor: '#fff',
		borderRadius: 24,
		padding: 24,
		shadowColor: '#000',
		shadowOpacity: 0.15,
		shadowRadius: 20,
		shadowOffset: { width: 0, height: 10 },
		elevation: 10,
	},
	modalHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 20,
	},
	modalTitle: {
		fontSize: 20,
		fontWeight: '800',
		color: PRIMARY,
	},
	closeBtn: {
		padding: 4,
		backgroundColor: '#e6ede8',
		borderRadius: 16,
	},
	graphLegend: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		backgroundColor: ACCENT,
		padding: 16,
		borderRadius: 16,
		marginBottom: 20,
	},
	legendTitle: {
		fontSize: 15,
		fontWeight: '700',
		color: PRIMARY,
	},
	legendValue: {
		fontSize: 24,
		fontWeight: '800',
		color: PRIMARY,
	},
	legendValueMax: {
		fontSize: 14,
		fontWeight: '600',
		color: PRIMARY,
		opacity: 0.7,
	},
	graph: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'flex-end',
		height: 200,
		marginBottom: 20,
		paddingHorizontal: 10,
	},
	graphColumn: {
		flex: 1,
		alignItems: 'center',
	},
	graphBarTrack: {
		width: 24,
		height: '80%',
		borderRadius: 12,
		backgroundColor: '#e6ede8',
		justifyContent: 'flex-end',
		overflow: 'hidden',
	},
	graphBar: {
		width: '100%',
		backgroundColor: PRIMARY,
		borderRadius: 12,
	},
	graphScore: {
		fontSize: 13,
		fontWeight: '700',
		color: PRIMARY,
		marginTop: 8,
	},
	graphLabel: {
		fontSize: 12,
		fontWeight: '600',
		color: MUTED,
		marginTop: 2,
	},
	progressList: {
		borderTopWidth: 1,
		borderTopColor: '#e6ede8',
		paddingTop: 16,
	},
	progressRow: {
		marginBottom: 16,
		backgroundColor: '#f6f8f7',
		padding: 12,
		borderRadius: 12,
	},
	progressRowMeta: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 6,
	},
	progressRowLabel: {
		fontSize: 13,
		fontWeight: '600',
		color: MUTED,
	},
	smSeverityPill: {
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: 12,
	},
	smSeverityText: {
		fontSize: 10,
		fontWeight: '800',
		color: PRIMARY,
	},
	imageSection: {
		marginTop: 16,
		paddingTop: 16,
		borderTopWidth: 1,
		borderTopColor: '#f0f4f1',
	},
	imageLabel: {
		fontSize: 12,
		fontWeight: '800',
		color: MUTED,
		marginBottom: 10,
		textTransform: 'uppercase',
		letterSpacing: 0.5,
	},
	imageScroll: {
		paddingRight: 10,
	},
	scanImageWrapper: {
		width: 100,
		height: 100,
		borderRadius: 12,
		marginRight: 10,
		backgroundColor: '#f6f8f7',
		overflow: 'hidden',
		borderWidth: 1,
		borderColor: '#e6ede8',
	},
	scanImage: {
		width: '100%',
		height: '100%',
		resizeMode: 'cover',
	},
	imageBadge: {
		position: 'absolute',
		bottom: 4,
		right: 4,
		backgroundColor: 'rgba(52, 66, 37, 0.7)',
		paddingHorizontal: 6,
		paddingVertical: 2,
		borderRadius: 6,
	},
	imageBadgeText: {
		color: '#fff',
		fontSize: 9,
		fontWeight: '800',
	},
	progressRowDiagnosis: {
		fontSize: 15,
		fontWeight: '700',
		color: PRIMARY,
	},
	loadingModalOverlay: {
		flex: 1,
		backgroundColor: 'rgba(52, 66, 37, 0.4)',
		justifyContent: 'center',
		alignItems: 'center',
	},
	loadingAlert: {
		width: 200,
		backgroundColor: '#fff',
		borderRadius: 24,
		padding: 30,
		alignItems: 'center',
		shadowColor: '#000',
		shadowOpacity: 0.15,
		shadowRadius: 15,
		shadowOffset: { width: 0, height: 8 },
		elevation: 8,
	},
	loadingAlertText: {
		marginTop: 15,
		fontSize: 15,
		fontWeight: '700',
		color: PRIMARY,
		textAlign: 'center',
	},
});
