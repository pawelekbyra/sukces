import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { daysInMonth, shiftMonth, monthKey, todayKey } from '../lib/dates';
import { colors, spacing, radius } from '../lib/theme';

const WEEKDAYS = ['P', 'W', 'Ś', 'C', 'P', 'S', 'N'];

export default function MonthCalendar({
  dayColor,
  onSelectDay,
  initialMonth,
}: {
  dayColor: (dateKey: string) => string;
  onSelectDay?: (dateKey: string) => void;
  initialMonth?: string;
}) {
  const [month, setMonth] = useState(initialMonth ?? monthKey());
  const days = daysInMonth(month);
  const firstWeekday = (new Date(days[0]).getDay() + 6) % 7; // 0 = poniedziałek
  const today = todayKey();

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <Pressable onPress={() => setMonth(shiftMonth(month, -1))} hitSlop={10}>
          <Text style={styles.nav}>‹</Text>
        </Pressable>
        <Text style={styles.monthLabel}>{month}</Text>
        <Pressable onPress={() => setMonth(shiftMonth(month, 1))} hitSlop={10}>
          <Text style={styles.nav}>›</Text>
        </Pressable>
      </View>
      <View style={styles.weekRow}>
        {WEEKDAYS.map((w, i) => (
          <Text key={i} style={styles.weekday}>
            {w}
          </Text>
        ))}
      </View>
      <View style={styles.grid}>
        {Array.from({ length: firstWeekday }).map((_, i) => (
          <View key={`pad-${i}`} style={styles.cell} />
        ))}
        {days.map((d) => {
          const dayNum = Number(d.split('-')[2]);
          const bg = dayColor(d);
          const isToday = d === today;
          return (
            <Pressable
              key={d}
              style={[styles.cell, styles.dayCell, { backgroundColor: bg }, isToday && styles.today]}
              onPress={() => onSelectDay?.(d)}
            >
              <Text style={styles.dayText}>{dayNum}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.md },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  nav: { color: colors.text, fontSize: 22, paddingHorizontal: spacing.md },
  monthLabel: { color: colors.text, fontSize: 16, fontWeight: '600' },
  weekRow: { flexDirection: 'row', marginBottom: spacing.xs },
  weekday: { flex: 1, textAlign: 'center', color: colors.textDim, fontSize: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: '14.28%', aspectRatio: 1, padding: 2 },
  dayCell: { borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
  today: { borderWidth: 2, borderColor: colors.text },
  dayText: { color: colors.text, fontSize: 12, fontWeight: '500' },
});
