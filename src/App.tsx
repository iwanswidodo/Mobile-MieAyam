import React, {useCallback, useEffect, useMemo, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Alert,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {SafeAreaProvider, SafeAreaView} from 'react-native-safe-area-context';
import {initialCatalog} from './data/catalog';
import type {CartItem, Product, Transaction} from './types/pos';
import {getTransactions, saveTransaction} from './storage/transactionStorage';
import {calculateChange, formatRupiah} from './utils/money';

type Tab = 'home' | 'cashier' | 'history' | 'settings';
type ApiProduct = {id:number;name:string;category:string;variant?:string;price:number;imageUrl?:string;active:boolean};
const API_URL_KEY='@pak-de-surya/api-url/v1';

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
  red: '#A94438',
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

function HomeScreen({navigate, transactions}: {navigate: (tab: Tab) => void; transactions: Transaction[]}) {
  const today = new Date().toDateString();
  const todays = transactions.filter(item => new Date(item.createdAt).toDateString() === today);
  const revenue = todays.reduce((sum, item) => sum + item.total, 0);
  const average = todays.length ? Math.round(revenue / todays.length) : 0;

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
        <Text style={styles.revenueValue}>{formatRupiah(revenue)}</Text>
        <Text style={styles.revenueHint}>{todays.length ? 'Berdasarkan transaksi tersimpan di perangkat' : 'Belum ada transaksi tercatat'}</Text>
        <View style={styles.revenueDivider} />
        <View style={styles.revenueFooter}>
          <Text style={styles.revenueFooterText}>Total transaksi</Text>
          <Text style={styles.revenueFooterValue}>{todays.length} pesanan</Text>
        </View>
      </View>
      <SectionTitle title="Ringkasan" />
      <View style={styles.statsGrid}>
        <StatCard label="Pesanan selesai" value={String(todays.length)} hint="Hari ini" />
        <StatCard label="Rata-rata pesanan" value={formatRupiah(average)} hint="Hari ini" />
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
        <Text style={styles.noticeTitle}>Mode offline-first</Text>
        <Text style={styles.noticeText}>Transaksi disimpan di perangkat terlebih dahulu. Sinkronisasi ke backend akan ditambahkan pada fase integrasi.</Text>
      </View>
    </ScrollView>
  );
}

function CashierScreen({
  catalog,
  apiBaseUrl,
  onRefreshCatalog,
  loadingCatalog,
  cart,
  onAdd,
  onIncrease,
  onDecrease,
  onRemove,
  onCheckout,
}: {
  catalog: Product[];
  apiBaseUrl: string;
  onRefreshCatalog: () => void;
  loadingCatalog: boolean;
  cart: CartItem[];
  onAdd: (product: Product) => void;
  onIncrease: (productId: string) => void;
  onDecrease: (productId: string) => void;
  onRemove: (productId: string) => void;
  onCheckout: () => void;
}) {
  const total = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text style={styles.greeting}>Kasir</Text>
      <Text style={styles.dateText}>Pilih produk untuk membuat pesanan</Text>
      <View style={styles.catalogCard}>
        <View style={{flexDirection:"row",justifyContent:"space-between",alignItems:"center"}}><SectionTitle title="Katalog produk" /><TouchableOpacity onPress={onRefreshCatalog}><Text style={styles.sectionAction}>{loadingCatalog?"Memuat...":"↻ Refresh"}</Text></TouchableOpacity></View>
        {catalog.length === 0 ? (
          <View style={styles.emptyCatalog}>
            <Text style={styles.emptyIcon}>▦</Text>
            <Text style={styles.emptyTitle}>Belum ada produk</Text>
            <Text style={styles.emptyText}>{loadingCatalog?"Mengambil produk dari server...":"Belum ada produk. Periksa alamat server di Pengaturan."}</Text>
          </View>
        ) : (
          catalog.filter(product => product.available).map(product => (
            <TouchableOpacity key={product.id} style={styles.productRow} onPress={() => onAdd(product)}>
              {product.imageUrl ? <Image source={{uri:product.imageUrl}} style={{width:50,height:50,borderRadius:9,marginRight:10}} /> : null}
              <View style={styles.productInfo}>
                <Text style={styles.productName}>{product.name}</Text>
                <Text style={styles.productPrice}>{product.category ? product.category+" · " : ""}{formatRupiah(product.price)}</Text>
              </View>
              <Text style={styles.addButton}>＋</Text>
            </TouchableOpacity>
          ))
        )}
      </View>
      <View style={styles.cartCard}>
        <View style={styles.cartHeading}>
          <Text style={styles.sectionTitle}>Keranjang</Text>
          <Text style={styles.cartCount}>{count} item</Text>
        </View>
        {cart.length === 0 ? (
          <Text style={styles.emptyCart}>Belum ada produk dipilih.</Text>
        ) : cart.map(item => (
          <View key={item.productId} style={styles.cartRow}>
            <View style={styles.cartItemInfo}>
              <Text style={styles.cartItemName}>{item.name}</Text>
              <Text style={styles.cartItemPrice}>{formatRupiah(item.unitPrice)} / item</Text>
              <TouchableOpacity onPress={() => onRemove(item.productId)}><Text style={styles.removeText}>Hapus</Text></TouchableOpacity>
            </View>
            <View style={styles.quantityControl}>
              <TouchableOpacity style={styles.quantityButton} onPress={() => onDecrease(item.productId)}><Text style={styles.quantityButtonText}>−</Text></TouchableOpacity>
              <Text style={styles.quantityText}>{item.quantity}</Text>
              <TouchableOpacity style={styles.quantityButton} onPress={() => onIncrease(item.productId)}><Text style={styles.quantityButtonText}>＋</Text></TouchableOpacity>
            </View>
          </View>
        ))}
        <View style={styles.totalLine}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>{formatRupiah(total)}</Text>
        </View>
        <TouchableOpacity style={[styles.primaryButton, cart.length === 0 && styles.disabledButton]} disabled={cart.length === 0} onPress={onCheckout}>
          <Text style={styles.primaryButtonText}>Lanjut ke pembayaran</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

function PaymentScreen({total, onBack, onComplete}: {total: number; onBack: () => void; onComplete: (amount: number) => Promise<void>}) {
  const [amountText, setAmountText] = useState('');
  const amount = Number(amountText.replace(/[^0-9]/g, '')) || 0;
  const change = calculateChange(amount, total);
  const valid = amount >= total && total > 0;

  return (
    <View style={styles.paymentScreen}>
      <TouchableOpacity onPress={onBack}><Text style={styles.backText}>‹ Kembali ke keranjang</Text></TouchableOpacity>
      <Text style={styles.greeting}>Pembayaran</Text>
      <Text style={styles.dateText}>Metode pembayaran: Tunai</Text>
      <View style={styles.paymentCard}>
        <Text style={styles.statLabel}>TOTAL TAGIHAN</Text>
        <Text style={styles.paymentTotal}>{formatRupiah(total)}</Text>
        <Text style={styles.inputLabel}>Uang diterima</Text>
        <TextInput
          value={amountText}
          onChangeText={value => setAmountText(value.replace(/[^0-9]/g, ''))}
          keyboardType="number-pad"
          placeholder="Masukkan nominal"
          placeholderTextColor="#A99B90"
          style={styles.moneyInput}
        />
        <View style={styles.changeRow}>
          <Text style={styles.totalLabel}>Kembalian</Text>
          <Text style={styles.changeValue}>{formatRupiah(change)}</Text>
        </View>
        <TouchableOpacity style={[styles.primaryButton, !valid && styles.disabledButton]} disabled={!valid} onPress={() => onComplete(amount)}>
          <Text style={styles.primaryButtonText}>Selesaikan & simpan transaksi</Text>
        </TouchableOpacity>
        {!valid && amountText.length > 0 ? <Text style={styles.validationText}>Nominal pembayaran kurang dari total tagihan.</Text> : null}
      </View>
      <Text style={styles.offlineNote}>Transaksi akan disimpan di perangkat ini. Pastikan data pembayaran sudah benar sebelum menyelesaikan.</Text>
    </View>
  );
}

function HistoryScreen({transactions}: {transactions: Transaction[]}) {
  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.greeting}>Riwayat Transaksi</Text>
      <Text style={styles.dateText}>Data transaksi yang tersimpan di perangkat</Text>
      {transactions.length === 0 ? (
        <View style={styles.emptyHistory}>
          <Text style={styles.emptyIcon}>▤</Text>
          <Text style={styles.emptyTitle}>Belum ada transaksi</Text>
          <Text style={styles.emptyText}>Transaksi yang selesai dibayar akan tampil di halaman ini.</Text>
        </View>
      ) : transactions.map(transaction => (
        <View key={transaction.id} style={styles.historyCard}>
          <View style={styles.historyTop}>
            <Text style={styles.historyId}>#{transaction.id.slice(-8).toUpperCase()}</Text>
            <Text style={styles.pendingPill}>Belum disinkronkan</Text>
          </View>
          <Text style={styles.historyDate}>{new Date(transaction.createdAt).toLocaleString('id-ID')}</Text>
          {transaction.items.map(item => (
            <Text key={item.productId} style={styles.historyItem}>{item.quantity} × {item.name} · {formatRupiah(item.unitPrice * item.quantity)}</Text>
          ))}
          <View style={styles.totalLine}>
            <Text style={styles.totalLabel}>Total dibayar</Text>
            <Text style={styles.totalValue}>{formatRupiah(transaction.total)}</Text>
          </View>
          <Text style={styles.historyMeta}>Tunai {formatRupiah(transaction.amountReceived)} · Kembalian {formatRupiah(transaction.change)}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

function SettingsScreen({apiBaseUrl,onSave,connectionMessage}:{apiBaseUrl:string;onSave:(url:string)=>Promise<void>;connectionMessage:string}) {
 const [url,setUrl]=useState(apiBaseUrl);
 useEffect(()=>setUrl(apiBaseUrl),[apiBaseUrl]);
 return <ScrollView contentContainerStyle={styles.content}>
  <Text style={styles.greeting}>Pengaturan Koneksi</Text>
  <Text style={styles.dateText}>Alamat server backend</Text>
  <View style={styles.paymentCard}>
   <Text style={styles.inputLabel}>URL API</Text>
   <TextInput value={url} onChangeText={setUrl} autoCapitalize="none" autoCorrect={false} keyboardType="url" placeholder="http://192.168.1.10:8080" placeholderTextColor="#A99B90" style={styles.moneyInput}/>
   <Text style={styles.offlineNote}>Masukkan IP/domain server yang dapat diakses HP. Jangan gunakan localhost pada HP fisik.</Text>
   <TouchableOpacity style={styles.primaryButton} onPress={()=>onSave(url)}><Text style={styles.primaryButtonText}>Simpan & hubungkan</Text></TouchableOpacity>
   <Text style={styles.offlineNote}>{connectionMessage}</Text>
  </View>
 </ScrollView>;
}
function PlaceholderScreen() {
  return (
    <View style={styles.placeholder}>
      <View style={styles.placeholderIcon}><Text style={styles.placeholderSymbol}>⚙</Text></View>
      <Text style={styles.placeholderTitle}>Pengaturan</Text>
      <Text style={styles.placeholderDescription}>Pengaturan printer Rongta, koneksi, dan akun akan ditambahkan setelah alur kasir stabil.</Text>
      <View style={styles.comingSoon}><Text style={styles.comingSoonText}>TAHAP BERIKUTNYA</Text></View>
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
  const [catalog,setCatalog] = useState<Product[]>(initialCatalog);
  const [apiBaseUrl,setApiBaseUrl] = useState('');
  const [loadingCatalog,setLoadingCatalog] = useState(false);
  const [connectionMessage,setConnectionMessage] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [paymentOpen, setPaymentOpen] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(API_URL_KEY).then(value => {if(value)setApiBaseUrl(value);}).catch(() => {});
    getTransactions().then(setTransactions).catch(() => {
      Alert.alert('Penyimpanan', 'Riwayat transaksi lokal belum dapat dibaca.');
    });
  }, []);


  const refreshCatalog = useCallback(async () => {
    if (!apiBaseUrl.trim()) {setConnectionMessage('Atur alamat server pada menu Pengaturan.');return;}
    setLoadingCatalog(true);
    try {
      const response=await fetch(apiBaseUrl.replace(/\/$/,'')+'/api/products');
      if(!response.ok) throw new Error('HTTP '+response.status);
      const rows:ApiProduct[]=await response.json();
      setCatalog(rows.filter(p=>p.active).map(p=>({
        id:String(p.id),name:p.variant?p.name+' · '+p.variant:p.name,
        price:p.price,category:p.category,available:p.active,
        imageUrl:p.imageUrl?(p.imageUrl.startsWith('http')?p.imageUrl:apiBaseUrl.replace(/\/$/,'')+p.imageUrl):undefined,
      })));
      setConnectionMessage('Terhubung. '+rows.length+' produk diterima.');
    } catch(e) {setConnectionMessage(e instanceof Error?e.message:'Gagal menghubungi server.');}
    finally {setLoadingCatalog(false);}
  },[apiBaseUrl]);
  useEffect(()=>{if(apiBaseUrl)void refreshCatalog();},[apiBaseUrl,refreshCatalog]);
  const saveApiUrl=async(url:string)=>{
    const normalized=url.trim().replace(/\/$/,'');
    await AsyncStorage.setItem(API_URL_KEY,normalized);
    setApiBaseUrl(normalized);
    setConnectionMessage('Alamat server disimpan.');
  };

  const cartTotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0),
    [cart],
  );

  const addProduct = (product: Product) => {
    setCart(current => {
      const found = current.find(item => item.productId === product.id);
      if (found) {
        return current.map(item => item.productId === product.id ? {...item, quantity: item.quantity + 1} : item);
      }
      return [...current, {productId: product.id, name: product.name, unitPrice: product.price, quantity: 1}];
    });
  };

  const changeQuantity = (productId: string, delta: number) => {
    setCart(current => current
      .map(item => item.productId === productId ? {...item, quantity: item.quantity + delta} : item)
      .filter(item => item.quantity > 0));
  };

  const completePayment = async (amountReceived: number) => {
    const transaction: Transaction = {
      id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      createdAt: new Date().toISOString(),
      items: cart,
      subtotal: cartTotal,
      total: cartTotal,
      paymentMethod: 'cash',
      amountReceived,
      change: calculateChange(amountReceived, cartTotal),
      syncStatus: 'pending',
    };
    try {
      await saveTransaction(transaction);
      setTransactions(current => [transaction, ...current]);
      setCart([]);
      setPaymentOpen(false);
      setActiveTab('history');
      Alert.alert('Transaksi tersimpan', 'Pembayaran berhasil dan transaksi sudah disimpan di perangkat.');
    } catch {
      Alert.alert('Gagal menyimpan', 'Transaksi belum tersimpan. Jangan tutup aplikasi dan coba lagi.');
    }
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
        <View style={styles.appHeader}>
          <View style={styles.brandLockup}>
            <Image source={require('../assets/pak-de-surya-logo.png')} style={styles.brandLogo} resizeMode="contain" />
            <View style={styles.brandTextWrap}>
              <Text style={styles.brandTitle}>MIE AYAM</Text>
              <Text style={styles.brandName}>PAK DE SURYA</Text>
              <Text style={styles.brandTagline}>LEZAT • HALAL • BERKAH</Text>
            </View>
          </View>
          <View style={styles.headerBadge}><Text style={styles.headerBadgeText}>POS</Text></View>
        </View>
        <View style={styles.screen}>
          {paymentOpen ? (
            <PaymentScreen total={cartTotal} onBack={() => setPaymentOpen(false)} onComplete={completePayment} />
          ) : activeTab === 'home' ? (
            <HomeScreen navigate={setActiveTab} transactions={transactions} />
          ) : activeTab === 'cashier' ? (
            <CashierScreen catalog={catalog} apiBaseUrl={apiBaseUrl} onRefreshCatalog={refreshCatalog} loadingCatalog={loadingCatalog} cart={cart} onAdd={addProduct} onIncrease={id => changeQuantity(id, 1)} onDecrease={id => changeQuantity(id, -1)} onRemove={id => setCart(current => current.filter(item => item.productId !== id))} onCheckout={() => setPaymentOpen(true)} />
          ) : activeTab === 'history' ? (
            <HistoryScreen transactions={transactions} />
          ) : <SettingsScreen apiBaseUrl={apiBaseUrl} onSave={saveApiUrl} connectionMessage={connectionMessage} />}
        </View>
        {!paymentOpen ? (
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
        ) : null}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: colors.background},
  appHeader: {height: 66, paddingHorizontal: 22, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: colors.line},
  brandLockup: {flexDirection: 'row', alignItems: 'center', flex: 1, minWidth: 0},
  brandLogo: {width: 58, height: 58},
  brandTextWrap: {marginLeft: 9, flexShrink: 1},
  brandTitle: {fontSize: 9, fontWeight: '800', letterSpacing: 1.8, color: colors.brownSoft},
  brandName: {fontSize: 16, fontWeight: '900', letterSpacing: 0.1, color: '#6A2417'},
  brandTagline: {fontSize: 8, fontWeight: '700', letterSpacing: 0.45, color: colors.brownSoft, marginTop: 2},
  headerBadge: {width: 38, height: 38, borderRadius: 13, backgroundColor: colors.brown, alignItems: 'center', justifyContent: 'center'},
  headerBadgeText: {fontSize: 12, fontWeight: '800', color: '#FFFFFF'},
  screen: {flex: 1},
  content: {padding: 20, paddingBottom: 30},
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
  revenueValue: {fontSize: 32, fontWeight: '800', color: '#FFFFFF', marginTop: 14},
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
  statValue: {fontSize: 20, fontWeight: '800', color: colors.brown, marginTop: 9},
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
  catalogCard: {backgroundColor: colors.surface, borderRadius: 17, padding: 16, marginTop: 20, borderWidth: 1, borderColor: colors.line},
  emptyCatalog: {alignItems: 'center', paddingVertical: 24, paddingHorizontal: 8},
  emptyIcon: {fontSize: 32, color: colors.accent},
  emptyTitle: {fontSize: 15, fontWeight: '800', color: colors.brown, marginTop: 10},
  emptyText: {fontSize: 12, lineHeight: 18, color: colors.muted, textAlign: 'center', marginTop: 6},
  productRow: {flexDirection: 'row', alignItems: 'center', paddingVertical: 13, borderTopWidth: 1, borderTopColor: colors.line},
  productInfo: {flex: 1},
  productName: {fontSize: 14, fontWeight: '700', color: colors.text},
  productPrice: {fontSize: 12, color: colors.muted, marginTop: 4},
  addButton: {fontSize: 24, color: colors.accent, paddingHorizontal: 8},
  cartCard: {backgroundColor: colors.surface, borderRadius: 17, padding: 16, marginTop: 15, borderWidth: 1, borderColor: colors.line},
  cartHeading: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'},
  cartCount: {fontSize: 11, color: colors.muted},
  emptyCart: {fontSize: 12, color: colors.muted, paddingVertical: 18, textAlign: 'center'},
  cartRow: {flexDirection: 'row', alignItems: 'center', paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: colors.line},
  cartItemInfo: {flex: 1},
  cartItemName: {fontSize: 13, fontWeight: '700', color: colors.text},
  cartItemPrice: {fontSize: 11, color: colors.muted, marginTop: 3},
  removeText: {fontSize: 11, color: colors.red, marginTop: 5},
  quantityControl: {flexDirection: 'row', alignItems: 'center', gap: 12},
  quantityButton: {width: 30, height: 30, borderRadius: 10, backgroundColor: colors.accentLight, alignItems: 'center', justifyContent: 'center'},
  quantityButtonText: {fontSize: 18, color: colors.brown, fontWeight: '700'},
  quantityText: {fontSize: 14, fontWeight: '800', color: colors.brown},
  totalLine: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 15, marginTop: 4},
  totalLabel: {fontSize: 13, color: colors.muted},
  totalValue: {fontSize: 17, fontWeight: '900', color: colors.brown},
  primaryButton: {backgroundColor: colors.brown, borderRadius: 13, paddingVertical: 15, alignItems: 'center', marginTop: 17},
  primaryButtonText: {fontSize: 13, fontWeight: '800', color: '#FFFFFF'},
  disabledButton: {opacity: 0.38},
  paymentScreen: {flex: 1, padding: 20},
  backText: {fontSize: 13, fontWeight: '700', color: colors.accent, marginBottom: 18},
  paymentCard: {backgroundColor: colors.surface, borderRadius: 18, padding: 19, marginTop: 22, borderWidth: 1, borderColor: colors.line},
  paymentTotal: {fontSize: 30, fontWeight: '900', color: colors.brown, marginTop: 7, marginBottom: 25},
  inputLabel: {fontSize: 12, fontWeight: '700', color: colors.text, marginBottom: 8},
  moneyInput: {height: 52, borderWidth: 1, borderColor: colors.line, borderRadius: 12, paddingHorizontal: 14, fontSize: 17, color: colors.brown, backgroundColor: '#FFFCF8'},
  changeRow: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20},
  changeValue: {fontSize: 17, fontWeight: '900', color: colors.green},
  validationText: {fontSize: 11, color: colors.red, marginTop: 10},
  offlineNote: {fontSize: 11, lineHeight: 17, color: colors.muted, marginTop: 18},
  emptyHistory: {alignItems: 'center', backgroundColor: colors.surface, borderRadius: 17, padding: 28, marginTop: 22},
  historyCard: {backgroundColor: colors.surface, borderRadius: 16, padding: 15, marginTop: 13, borderWidth: 1, borderColor: colors.line},
  historyTop: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
  historyId: {fontSize: 12, fontWeight: '900', color: colors.brown},
  pendingPill: {fontSize: 9, color: colors.brownSoft, backgroundColor: colors.accentLight, overflow: 'hidden', paddingHorizontal: 8, paddingVertical: 5, borderRadius: 9},
  historyDate: {fontSize: 10, color: colors.muted, marginTop: 5, marginBottom: 10},
  historyItem: {fontSize: 11, color: colors.text, marginTop: 5},
  historyMeta: {fontSize: 10, color: colors.muted, marginTop: 8},
  placeholder: {flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 34},
  placeholderIcon: {width: 76, height: 76, borderRadius: 25, backgroundColor: colors.accentLight, alignItems: 'center', justifyContent: 'center'},
  placeholderSymbol: {fontSize: 38, color: colors.brown},
  placeholderTitle: {fontSize: 23, fontWeight: '800', color: colors.brown, marginTop: 20},
  placeholderDescription: {fontSize: 13, lineHeight: 21, color: colors.muted, textAlign: 'center', marginTop: 9},
  comingSoon: {marginTop: 20, paddingHorizontal: 13, paddingVertical: 9, borderRadius: 20, backgroundColor: '#EDE3D8'},
  comingSoonText: {fontSize: 9, fontWeight: '800', letterSpacing: 0.8, color: colors.brownSoft},
  bottomNav: {height: 72, flexDirection: 'row', backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.line, paddingHorizontal: 8, paddingTop: 7, paddingBottom: 5},
  navItem: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  navIconWrap: {width: 34, height: 30, borderRadius: 11, alignItems: 'center', justifyContent: 'center'},
  navIconWrapActive: {backgroundColor: colors.accentLight},
  navSymbol: {fontSize: 21, color: colors.muted},
  navSymbolActive: {color: colors.brown, fontWeight: '800'},
  navLabel: {fontSize: 10, color: colors.muted, marginTop: 2},
  navLabelActive: {fontSize: 10, color: colors.brown, fontWeight: '800'},
});
