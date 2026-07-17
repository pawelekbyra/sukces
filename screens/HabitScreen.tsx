import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { useStore } from '../lib/store';
import { currentStreak, longestStreak, relapseDatesInMonth } from '../lib/selectors';
import { colors, spacing, radius } from '../lib/theme';
import MonthCalendar from '../components/MonthCalendar';
import { todayKey } from '../lib/dates';
import { HabitId } from '../lib/types';

export default function HabitScreen({ route }: any) {
  const { habitId, label } = route.params as { habitId: HabitId; label: string };
  const state = useStore();
  const addRelapse = useStore((s) => s.addRelapse);
  const removeRelapse = useStore((s) => s.removeRelapse);
  const setHabitStart = useStore((s) => s.setHabitStart);

  const [lastRelapseId, setLastRelapseId] = useState<string | null>(null);
  const [undoVisible, setUndoVisible] = useState(false);

  const streak = currentStreak(state, habitId);
  const record = longestStreak(state, habitId);
  const relapseDates = relapseDatesInMonth(state, habitId);

  function handleRelapse() {
    const id = addRelapse(habitId);
    setLastRelapseId(id);
    setUndoVisible(true);
    setTimeout(() => setUndoVisible(false), 5000);
  }

  function handleUndo() {
    if (lastRelapseId) removeRelapse(lastRelapseId);
    setUndoVisible(false);
  }

  function handleBackdate(dateKey: string) {
    if (dateKey === todayKey()) {
      handleRelapse();
      return;
    }
    addRelapse(habitId, dateKey);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.streakBox}>
          <Text style={[styles.streakNumber, { color: streak > 0 ? colors.habitGreen : colors.textDim }]}>
            {streak}
          </Text>
          <Text style={styles.streakLabel}>dni bez relapsu</Text>
          <Text style={styles.record}>Rekord: {record} dni</Text>
        </View>

        {!state.habitStart[habitId] && (
          <Pressable style={styles.secondaryBtn} onPress={() => setHabitStart(habitId, todayKey())}>
            <Text style={styles.secondaryBtnText}>Zacznij liczyć od dziś</Text>
          </Pressable>
        )}

        <Pressable style={styles.relapseBtn} onPress={handleRelapse}>
          <Text style={styles.relapseBtnText}>Relapse dzisiaj</Text>
        </Pressable>

        {undoVisible && (
          <Pressable style={styles.undoBtn} onPress={handleUndo}>
            <Text style={styles.undoBtnText}>Cofnij</Text>
          </Pressable>
        )}

        <Text style={styles.sectionLabel}>Kalendarz (tapnij dzień, żeby zgłosić relaps wstecz)</Text>
        <MonthCalendar
          dayColor={(d) => (relapseDates.has(d) ? colors.habitRed : colors.habitNeutral)}
          onSelectDay={handleBackdate}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  container: { padding: spacing.md, gap: spacing.md },
  title: { color: colors.text, fontSize: 24, fontWeight: '700' },
  streakBox: { alignItems: 'center', paddingVertical: spacing.lg },
  streakNumber: { fontSize: 64, fontWeight: '800' },
  streakLabel: { color: colors.textDim, fontSize: 16 },
  record: { color: colors.textDim, fontSize: 14, marginTop: spacing.xs },
  relapseBtn: {
    backgroundColor: colors.habitRed,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  relapseBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  undoBtn: { alignItems: 'center', padding: spacing.sm },
  undoBtnText: { color: colors.textDim, textDecorationLine: 'underline' },
  secondaryBtn: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.sm,
    alignItems: 'center',
  },
  secondaryBtnText: { color: colors.text },
  sectionLabel: { color: colors.textDim, fontSize: 13 },
});
