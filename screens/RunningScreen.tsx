import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, SafeAreaView, ScrollView, TextInput } from 'react-native';
import { useStore } from '../lib/store';
import { totalKm, kmInRange, longestRun, bestWeekKm } from '../lib/selectors';
import { colors, spacing, radius } from '../lib/theme';
import MonthCalendar from '../components/MonthCalendar';
import { todayKey, monthKey, daysInMonth } from '../lib/dates';

export default function RunningScreen() {
  const state = useStore();
  const addRun = useStore((s) => s.addRun);
  const removeRun = useStore((s) => s.removeRun);
  const [km, setKm] = useState('');
  const [lastRunId, setLastRunId] = useState<string | null>(null);
  const [undoVisible, setUndoVisible] = useState(false);

  const today = todayKey();
  const monthStart = daysInMonth(monthKey())[0];
  const weekAgo = addDaysStr(today, -6);

  function handleAdd() {
    const value = parseFloat(km.replace(',', '.'));
    if (!value || value <= 0) return;
    const id = addRun(value, today);
    setLastRunId(id);
    setUndoVisible(true);
    setKm('');
    setTimeout(() => setUndoVisible(false), 5000);
  }

  function handleUndo() {
    if (lastRunId) removeRun(lastRunId);
    setUndoVisible(false);
  }

  const runDates = new Set(state.runs.map((r) => r.dateKey));

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.addRow}>
          <TextInput
            style={styles.input}
            placeholder="km dzisiaj"
            placeholderTextColor={colors.textDim}
            keyboardType="decimal-pad"
            value={km}
            onChangeText={setKm}
          />
          <Pressable style={styles.addBtn} onPress={handleAdd}>
            <Text style={styles.addBtnText}>Dodaj</Text>
          </Pressable>
        </View>
        {undoVisible && (
          <Pressable onPress={handleUndo}>
            <Text style={styles.undo}>Cofnij</Text>
          </Pressable>
        )}

        <View style={styles.statsRow}>
          <Stat label="Ten tydzień" value={`${kmInRange(state, weekAgo, today)} km`} />
          <Stat label="Ten miesiąc" value={`${kmInRange(state, monthStart, today)} km`} />
          <Stat label="Łącznie" value={`${totalKm(state)} km`} />
        </View>
        <View style={styles.statsRow}>
          <Stat label="Najdłuższy bieg" value={`${longestRun(state)} km`} />
          <Stat label="Najlepszy tydzień" value={`${bestWeekKm(state)} km`} />
        </View>

        <Text style={styles.sectionLabel}>Kalendarz</Text>
        <MonthCalendar dayColor={(d) => (runDates.has(d) ? colors.runBlue : colors.habitNeutral)} />

        <Text style={styles.sectionLabel}>Historia</Text>
        {[...state.runs]
          .sort((a, b) => (a.dateKey < b.dateKey ? 1 : -1))
          .map((r) => (
            <View key={r.id} style={styles.historyRow}>
              <Text style={styles.historyDate}>{r.dateKey}</Text>
              <Text style={styles.historyKm}>{r.km} km</Text>
              <Pressable onPress={() => removeRun(r.id)}>
                <Text style={styles.delete}>Usuń</Text>
              </Pressable>
            </View>
          ))}
      </ScrollView>
    </SafeAreaView>
  );
}

function addDaysStr(dateKey: string, n: number): string {
  const [y, m, d] = dateKey.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + n);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  container: { padding: spacing.md, gap: spacing.md },
  title: { color: colors.text, fontSize: 24, fontWeight: '700' },
  addRow: { flexDirection: 'row', gap: spacing.sm },
  input: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: radius.sm,
    padding: spacing.sm,
    color: colors.text,
  },
  addBtn: { backgroundColor: colors.runBlue, borderRadius: radius.sm, paddingHorizontal: spacing.md, justifyContent: 'center' },
  addBtnText: { color: '#fff', fontWeight: '700' },
  undo: { color: colors.textDim, textDecorationLine: 'underline' },
  statsRow: { flexDirection: 'row', gap: spacing.sm },
  stat: { flex: 1, backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.sm, alignItems: 'center' },
  statValue: { color: colors.runBlue, fontWeight: '700', fontSize: 16 },
  statLabel: { color: colors.textDim, fontSize: 11 },
  sectionLabel: { color: colors.textDim, fontSize: 13 },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    padding: spacing.sm,
    borderRadius: radius.sm,
    alignItems: 'center',
  },
  historyDate: { color: colors.text },
  historyKm: { color: colors.runBlue, fontWeight: '600' },
  delete: { color: colors.habitRed },
});
