import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, SafeAreaView, ScrollView, TextInput, Modal } from 'react-native';
import { useStore } from '../lib/store';
import { netWorthAt, dayNetChange } from '../lib/selectors';
import { colors, spacing, radius } from '../lib/theme';
import MonthCalendar from '../components/MonthCalendar';
import { todayKey, formatDisplay } from '../lib/dates';
import { FinanceEventType } from '../lib/types';

export default function FinanceScreen() {
  const state = useStore();
  const addFinanceEvent = useStore((s) => s.addFinanceEvent);
  const setFinanceStart = useStore((s) => s.setFinanceStart);

  const [selectedDay, setSelectedDay] = useState(todayKey());
  const [debtMenuOpen, setDebtMenuOpen] = useState(false);
  const [addModal, setAddModal] = useState<FinanceEventType | 'debt_incur_form' | 'debt_payoff_form' | null>(null);
  const [amount, setAmount] = useState('');
  const [desc, setDesc] = useState('');

  const netWorth = netWorthAt(state, selectedDay);

  if (!state.financeStart) {
    return <StartingPointForm onSubmit={(a, l) => setFinanceStart(a, l)} />;
  }

  function openForm(type: FinanceEventType) {
    setAmount('');
    setDesc('');
    setAddModal(type);
    setDebtMenuOpen(false);
  }

  function submitForm() {
    const value = parseFloat(amount.replace(',', '.'));
    if (!value || value <= 0 || !addModal) return;
    addFinanceEvent(addModal as FinanceEventType, value, desc, selectedDay);
    setAddModal(null);
  }

  const dayEvents = state.financeEvents.filter((e) => e.dateKey === selectedDay);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.dateLabel}>{formatDisplay(selectedDay)}</Text>

        <View style={styles.netWorthBox}>
          <Text style={styles.netWorthValue}>{netWorth} zł</Text>
          <Text style={styles.netWorthLabel}>stan na ten dzień</Text>
        </View>

        <View style={styles.actionsRow}>
          <Pressable style={[styles.actionBtn, { backgroundColor: colors.financeGreen }]} onPress={() => openForm('income')}>
            <Text style={styles.actionBtnText}>Dodaj wpływ</Text>
          </Pressable>
          <Pressable style={[styles.actionBtn, { backgroundColor: colors.habitRed }]} onPress={() => openForm('expense')}>
            <Text style={styles.actionBtnText}>Dodaj wydatek</Text>
          </Pressable>
        </View>

        <Pressable style={styles.liabilitiesBtn} onPress={() => setDebtMenuOpen(true)}>
          <Text style={styles.liabilitiesText}>Dług: dotknij żeby zarządzać</Text>
        </Pressable>

        <Text style={styles.sectionLabel}>Zdarzenia tego dnia</Text>
        {dayEvents.length === 0 && <Text style={styles.empty}>Brak zdarzeń</Text>}
        {dayEvents.map((e) => (
          <View key={e.id} style={styles.eventRow}>
            <Text style={styles.eventDesc}>{eventLabel(e.type)}{e.description ? ` — ${e.description}` : ''}</Text>
            <Text style={styles.eventAmount}>{e.amount} zł</Text>
          </View>
        ))}

        <Text style={styles.sectionLabel}>Kalendarz</Text>
        <MonthCalendar
          dayColor={(d) => {
            const change = dayNetChange(state, d);
            if (change > 0) return colors.financeGreen;
            return colors.financeNeutral;
          }}
          onSelectDay={setSelectedDay}
        />
      </ScrollView>

      <Modal visible={debtMenuOpen} transparent animationType="fade">
        <Pressable style={styles.modalBackdrop} onPress={() => setDebtMenuOpen(false)}>
          <View style={styles.menuBox}>
            <Pressable style={styles.menuItem} onPress={() => openForm('debt_incur')}>
              <Text style={styles.menuItemText}>Zaciągnąłem dług</Text>
            </Pressable>
            <Pressable style={styles.menuItem} onPress={() => openForm('debt_payoff')}>
              <Text style={styles.menuItemText}>Spłaciłem dług</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      <Modal visible={addModal !== null} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.formBox}>
            <Text style={styles.formTitle}>{addModal ? eventLabel(addModal as FinanceEventType) : ''}</Text>
            <TextInput
              style={styles.input}
              placeholder="kwota"
              placeholderTextColor={colors.textDim}
              keyboardType="decimal-pad"
              value={amount}
              onChangeText={setAmount}
            />
            <TextInput
              style={styles.input}
              placeholder="opis (opcjonalnie)"
              placeholderTextColor={colors.textDim}
              value={desc}
              onChangeText={setDesc}
            />
            <View style={styles.formActions}>
              <Pressable style={styles.cancelBtn} onPress={() => setAddModal(null)}>
                <Text style={styles.cancelBtnText}>Anuluj</Text>
              </Pressable>
              <Pressable style={styles.submitBtn} onPress={submitForm}>
                <Text style={styles.submitBtnText}>Zapisz</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function eventLabel(type: FinanceEventType): string {
  switch (type) {
    case 'expense':
      return 'Wydatek';
    case 'income':
      return 'Wpływ';
    case 'debt_incur':
      return 'Zaciągnięty dług';
    case 'debt_payoff':
      return 'Spłata długu';
  }
}

function StartingPointForm({ onSubmit }: { onSubmit: (assets: number, liabilities: number) => void }) {
  const [assets, setAssets] = useState('');
  const [liabilities, setLiabilities] = useState('0');
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>Punkt startowy</Text>
        <Text style={styles.sectionLabel}>Ile masz teraz gotówki/oszczędności (Assets)?</Text>
        <TextInput style={styles.input} keyboardType="decimal-pad" value={assets} onChangeText={setAssets} placeholder="0" placeholderTextColor={colors.textDim} />
        <Text style={styles.sectionLabel}>Ile masz teraz długów (Liabilities)?</Text>
        <TextInput style={styles.input} keyboardType="decimal-pad" value={liabilities} onChangeText={setLiabilities} placeholder="0" placeholderTextColor={colors.textDim} />
        <Pressable
          style={styles.submitBtn}
          onPress={() => onSubmit(parseFloat(assets.replace(',', '.')) || 0, parseFloat(liabilities.replace(',', '.')) || 0)}
        >
          <Text style={styles.submitBtnText}>Zacznij</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  container: { padding: spacing.md, gap: spacing.md },
  title: { color: colors.text, fontSize: 24, fontWeight: '700' },
  dateLabel: { color: colors.textDim },
  netWorthBox: { alignItems: 'center', paddingVertical: spacing.lg },
  netWorthValue: { color: colors.financeGold, fontSize: 48, fontWeight: '800' },
  netWorthLabel: { color: colors.textDim },
  actionsRow: { flexDirection: 'row', gap: spacing.sm },
  actionBtn: { flex: 1, borderRadius: radius.md, padding: spacing.md, alignItems: 'center' },
  actionBtnText: { color: '#fff', fontWeight: '700' },
  liabilitiesBtn: { backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.md, alignItems: 'center' },
  liabilitiesText: { color: colors.text },
  sectionLabel: { color: colors.textDim, fontSize: 13 },
  empty: { color: colors.textDim, fontStyle: 'italic' },
  eventRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    padding: spacing.sm,
    borderRadius: radius.sm,
  },
  eventDesc: { color: colors.text, flex: 1 },
  eventAmount: { color: colors.financeGold, fontWeight: '600' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  menuBox: { backgroundColor: colors.card, borderRadius: radius.md, overflow: 'hidden', width: '80%' },
  menuItem: { padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  menuItemText: { color: colors.text, fontSize: 16, textAlign: 'center' },
  formBox: { backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.md, width: '85%', gap: spacing.sm },
  formTitle: { color: colors.text, fontSize: 18, fontWeight: '700' },
  input: {
    backgroundColor: colors.bg,
    borderRadius: radius.sm,
    padding: spacing.sm,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  formActions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  cancelBtn: { flex: 1, padding: spacing.sm, alignItems: 'center' },
  cancelBtnText: { color: colors.textDim },
  submitBtn: { flex: 1, backgroundColor: colors.financeGold, borderRadius: radius.sm, padding: spacing.sm, alignItems: 'center' },
  submitBtnText: { color: colors.bg, fontWeight: '700' },
});
