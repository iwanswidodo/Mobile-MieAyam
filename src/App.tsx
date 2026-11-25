import React, {useState} from 'react';
import {SafeAreaProvider, SafeAreaView} from 'react-native-safe-area-context';
import {
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

type Tab = 'home' | 'cashier' | 'history' | 'settings';

const colors = {
  background: '#F7F1E8',
  surface: '#FFFFFF',
  brown: '#493326',
  brownSoft: '#8A684E',
  text: '#3D332D',
  muted: '#887B70',
  line: '#EDE3D8',
  accent: '#C77B43',
  accentLight: '#F5E5D5',
  green: '#47765B',
};

function SectionTitle({title, action}: {title: string; action?: string}) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {action ? <Text style={styles.sectionAction}>{action}</Text> : null}
    </View>
  );
}

function StatCard({label, value, hint}: {label: string; value: string; hint: string}) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statHint}>{hint}</Text>
    </View>
  );
}

function HomeScreen({navigate}: {navigate: (tab: Tab) => void}) {
  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.greetingRow}>
        <View>
          <Text style={styles.eyebrow}>MIE AYAM PAK DE SURYA</Text>
          <Text style={styles.greeting}>Selamat datang!</Text>
          <Text style={styles.dateText}>Ringkasan usaha hari ini</Text>
        </View>
        <View style={styles.avatar}><Text style={styles.avatarText}>PD</Text></View>
      </View>

      <View style={styles.revenueCard}>
        <View style={styles.revenueTop}>
          <Text style={styles.revenueLabel}>PENJUALAN HARI INI</Text>
          <Text style={styles.livePill}>● HARI INI</Text>
        </View>
        <Text style={styles.revenueValue}>Rp 0</Text>
        <Text style={styles.revenueHint}>Belum ada transaksi tercatat</Text>
        <View style={styles.revenueDivider} />
        <View style={styles.revenueFooter}>
          <Text style={styles.revenueFooterText}>Total transaksi</Text>
          <Text style={styles.revenueFooterValue}>0 pesanan</Text>
        </View>
      </View>

      <SectionTitle title="Ringkasan" />
      <View style={styles.statsGrid}>
        <StatCard label="Pesanan selesai" value="0" hint="Hari ini" />
        <StatCard label="Rata-rata pesanan" value="Rp 0" hint="Hari ini" />
      </View>

      <SectionTitle title="Menu utama" />
      <View style={styles.actionGrid}>
        <TouchableOpacity style={styles.actionCard} activeOpacity={0.8} onPress={() => navigate('cashier')}>
          <View style={[styles.actionIcon, {backgroundColor: colors.accentLight}]}><Text style={styles.actionEmoji}>＋</Text></View>
          <Text style={styles.actionTitle}>Kasir</Text>
          <Text style={styles.actionDescription}>Buat pesanan baru</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionCard} activeOpacity={0.8} onPress={() => navigate('history')}>
          <View style={[styles.actionIcon, {backgroundColor: '#E5EEE7'}]}><Text style={styles.actionEmoji}>▤</Text></View>
          <Text style={styles.actionTitle}>Riwayat</Text>
          <Text style={styles.actionDescription}>Lihat transaksi</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.noticeCard}>
        <Text style={styles.noticeTitle}>Informasi aplikasi</Text>
        <Text style={styles.noticeText}>Dashboard ini adalah tahap awal tampilan. Data penjualan akan terhubung ke backend pada fase integrasi.</Text>
      </View>
    </ScrollView>
  );
}

function PlaceholderScreen({tab}: {tab: Exclude<Tab, 'home'>}) {
  const content = {
    cashier: {symbol: '＋', title: 'Kasir', description: 'Halaman pemesanan akan dibangun pada Phase 2 dan Phase 3.'},
    history: {symbol: '▤', title: 'Riwayat Transaksi', description: 'Daftar transaksi dan detail pembayaran akan tersedia setelah modul transaksi dibuat.'},
    settings: {symbol: '⚙', title: 'Pengaturan', description: 'Pengaturan printer, koneksi, dan akun akan ditambahkan pada fase berikutnya.'},
  }[tab];

  return (
    <View style={styles.placeholder}>
      <View style={styles.placeholderIcon}><Text style={styles.placeholderSymbol}>{content.symbol}</Text></View>
      <Text style={styles.placeholderTitle}>{content.title}</Text>
      <Text style={styles.placeholderDescription}>{content.description}</Text>
      <View style={styles.comingSoon}><Text style={styles.comingSoonText}>SEDANG DALAM PENGEMBANGAN</Text></View>
    </View>
  );
}

const tabs: {key: Tab; label: string; symbol: string}[] = [
  {key: 'home', label: 'Beranda', symbol: '⌂'},
  {key: 'cashier', label: 'Kasir', symbol: '＋'},
  {key: 'history', label: 'Riwayat', symbol: '▤'},
  {key: 'settings', label: 'Setting', symbol: '⚙'},
];

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('home');

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <View style={styles.appHeader}>
        <Image source={require('../assets/pak-de-surya-logo.png')} style={styles.brandLogo} resizeMode="contain" />
        <View style={styles.headerBadge}><Text style={styles.headerBadgeText}>POS</Text></View>
      </View>

      <View style={styles.screen}>
        {activeTab === 'home'
          ? <HomeScreen navigate={setActiveTab} />
          : <PlaceholderScreen tab={activeTab} />}
      </View>

      <View style={styles.bottomNav}>
        {tabs.map(tab => {
          const selected = activeTab === tab.key;
          return (
            <TouchableOpacity key={tab.key} style={styles.navItem} activeOpacity={0.75} onPress={() => setActiveTab(tab.key)}>
              <View style={[styles.navIconWrap, selected && styles.navIconWrapActive]}>
                <Text style={[styles.navSymbol, selected && styles.navSymbolActive]}>{tab.symbol}</Text>
              </View>
              <Text style={[styles.navLabel, selected && styles.navLabelActive]}>{tab.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: colors.background},
  appHeader: {height: 66, paddingHorizontal: 22, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: colors.line},
  brandLogo: {width: 168, height: 62},
  headerSubtitle: {fontSize: 11, color: colors.muted, marginTop: 2, letterSpacing: 0.5},
  headerBadge: {width: 38, height: 38, borderRadius: 13, backgroundColor: colors.brown, alignItems: 'center', justifyContent: 'center'},
  headerBadgeText: {fontSize: 12, fontWeight: '800', color: '#FFFFFF'},
  screen: {flex: 1},
  content: {padding: 20, paddingBottom: 28},
  greetingRow: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20},
  eyebrow: {fontSize: 10, letterSpacing: 1.3, fontWeight: '800', color: colors.brownSoft},
  greeting: {fontSize: 25, fontWeight: '800', color: colors.brown, marginTop: 7},
  dateText: {fontSize: 13, color: colors.muted, marginTop: 4},
  avatar: {width: 46, height: 46, borderRadius: 16, backgroundColor: colors.accentLight, alignItems: 'center', justifyContent: 'center'},
  avatarText: {fontSize: 14, fontWeight: '800', color: colors.brown},
  revenueCard: {backgroundColor: colors.brown, borderRadius: 20, padding: 20, marginBottom: 24},
  revenueTop: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'},
  revenueLabel: {fontSize: 10, fontWeight: '800', letterSpacing: 1, color: '#E8D8C8'},
  livePill: {fontSize: 9, fontWeight: '700', color: '#F6D5B8'},
  revenueValue: {fontSize: 34, fontWeight: '800', color: '#FFFFFF', marginTop: 14},
  revenueHint: {fontSize: 12, color: '#D7C4B2', marginTop: 3},
  revenueDivider: {height: 1, backgroundColor: '#725D4E', marginVertical: 17},
  revenueFooter: {flexDirection: 'row', justifyContent: 'space-between'},
  revenueFooterText: {fontSize: 12, color: '#D7C4B2'},
  revenueFooterValue: {fontSize: 12, fontWeight: '700', color: '#FFFFFF'},
  sectionHeader: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12},
  sectionTitle: {fontSize: 16, fontWeight: '800', color: colors.brown},
  sectionAction: {fontSize: 12, fontWeight: '700', color: colors.accent},
  statsGrid: {flexDirection: 'row', gap: 12, marginBottom: 24},
  statCard: {flex: 1, backgroundColor: colors.surface, borderRadius: 16, padding: 15, borderWidth: 1, borderColor: colors.line},
  statLabel: {fontSize: 11, color: colors.muted},
  statValue: {fontSize: 21, fontWeight: '800', color: colors.brown, marginTop: 9},
  statHint: {fontSize: 10, color: colors.muted, marginTop: 4},
  actionGrid: {flexDirection: 'row', gap: 12, marginBottom: 20},
  actionCard: {flex: 1, backgroundColor: colors.surface, borderRadius: 17, padding: 15, borderWidth: 1, borderColor: colors.line},
  actionIcon: {width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 12},
  actionEmoji: {fontSize: 25, fontWeight: '600', color: colors.brown},
  actionTitle: {fontSize: 14, fontWeight: '800', color: colors.brown},
  actionDescription: {fontSize: 11, color: colors.muted, marginTop: 4},
  noticeCard: {padding: 15, borderRadius: 15, backgroundColor: '#F1E7DB'},
  noticeTitle: {fontSize: 12, fontWeight: '800', color: colors.brown},
  noticeText: {fontSize: 11, lineHeight: 17, color: colors.brownSoft, marginTop: 5},
  bottomNav: {height: 72, flexDirection: 'row', backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.line, paddingHorizontal: 8, paddingTop: 7, paddingBottom: 5},
  navItem: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  navIconWrap: {width: 34, height: 30, borderRadius: 11, alignItems: 'center', justifyContent: 'center'},
  navIconWrapActive: {backgroundColor: colors.accentLight},
  navSymbol: {fontSize: 21, color: colors.muted},
  navSymbolActive: {color: colors.brown, fontWeight: '800'},
  navLabel: {fontSize: 10, color: colors.muted, marginTop: 2},
  navLabelActive: {fontSize: 10, color: colors.brown, fontWeight: '800'},
  placeholder: {flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 34},
  placeholderIcon: {width: 76, height: 76, borderRadius: 25, backgroundColor: colors.accentLight, alignItems: 'center', justifyContent: 'center'},
  placeholderSymbol: {fontSize: 38, color: colors.brown},
  placeholderTitle: {fontSize: 23, fontWeight: '800', color: colors.brown, marginTop: 20},
  placeholderDescription: {fontSize: 13, lineHeight: 21, color: colors.muted, textAlign: 'center', marginTop: 9},
  comingSoon: {marginTop: 20, paddingHorizontal: 13, paddingVertical: 9, borderRadius: 20, backgroundColor: '#EDE3D8'},
  comingSoonText: {fontSize: 9, fontWeight: '800', letterSpacing: 0.8, color: colors.brownSoft},
});
