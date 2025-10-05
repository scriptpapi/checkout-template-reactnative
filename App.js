// App.js
import React, { createContext, useContext, useMemo, useState, useLayoutEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import {
  View, Text, FlatList, TouchableOpacity, SafeAreaView, StyleSheet, Alert,
} from "react-native";

const Stack = createNativeStackNavigator();

/* ------------------------ Cart State (Context) ------------------------ */
const CartContext = createContext();

function CartProvider({ children }) {
  const [items, setItems] = useState([]); // [{id, name, price, qty}]

  const addItem = (product) => {
    setItems((prev) => {
      const idx = prev.findIndex((p) => p.id === product.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], qty: copy[idx].qty + 1 };
        return copy;
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const removeItem = (id) => setItems((prev) => prev.filter((p) => p.id !== id));

  const setQty = (id, qty) => {
    setItems((prev) =>
      prev
        .map((p) => (p.id === id ? { ...p, qty: Math.max(1, qty) } : p))
        .filter((p) => p.qty > 0)
    );
  };

  const totalCount = useMemo(() => items.reduce((n, p) => n + p.qty, 0), [items]);
  const totalPrice = useMemo(
    () => items.reduce((sum, p) => sum + p.price * p.qty, 0),
    [items]
  );

  const value = { items, addItem, removeItem, setQty, totalCount, totalPrice };
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

const useCart = () => useContext(CartContext);

/* ---------------------------- Sample Data ---------------------------- */
const PRODUCTS = [
  { id: "sku_1", name: "Wireless Mouse", price: 19.99 },
  { id: "sku_2", name: "Mechanical Keyboard", price: 79.0 },
  { id: "sku_3", name: "USB-C Hub", price: 29.5 },
  { id: "sku_4", name: "Noise-Cancel Headphones", price: 129.99 },
];

/* -------------------------- Screens / UI ----------------------------- */
function ProductsScreen({ navigation }) {
  const { addItem, totalCount } = useCart();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => <CartButton onPress={() => navigation.navigate("Checkout")} count={totalCount} />,
      title: "Shop",
    });
  }, [navigation, totalCount]);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <FlatList
        data={PRODUCTS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View>
              <Text style={styles.title}>{item.name}</Text>
              <Text style={styles.price}>${item.price.toFixed(2)}</Text>
            </View>
            <TouchableOpacity style={styles.primaryBtn} onPress={() => addItem(item)}>
              <Text style={styles.btnText}>Add to cart</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

function CheckoutScreen() {
  const { items, setQty, removeItem, totalPrice } = useCart();

  const placeOrder = () => {
    Alert.alert("Not wired yet", "Hook your payment here. This is a demo.");
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={<Text style={styles.sectionHeader}>Your Cart</Text>}
        ListEmptyComponent={<Text style={{ padding: 16 }}>Your cart is empty.</Text>}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        renderItem={({ item }) => (
          <View style={styles.cartRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.cartTitle}>{item.name}</Text>
              <Text style={styles.cartSubtitle}>${item.price.toFixed(2)}</Text>
            </View>
            <View style={styles.qtyBox}>
              <TouchableOpacity onPress={() => setQty(item.id, item.qty - 1)} style={styles.qtyBtn}>
                <Text style={styles.qtyBtnText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.qtyText}>{item.qty}</Text>
              <TouchableOpacity onPress={() => setQty(item.id, item.qty + 1)} style={styles.qtyBtn}>
                <Text style={styles.qtyBtnText}>+</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={() => removeItem(item.id)} style={{ paddingHorizontal: 8 }}>
              <Text style={{ color: "#c00", fontWeight: "600" }}>Remove</Text>
            </TouchableOpacity>
          </View>
        )}
        ListFooterComponent={
          <View style={{ marginTop: 16 }}>
            <Text style={styles.sectionHeader}>Payment</Text>

            {/* --------- Placeholder for your card form --------- */}
            <View style={styles.cardFormPlaceholder}>
              <Text style={{ fontWeight: "600" }}>Card Form Placeholder</Text>
              <Text style={{ color: "#666", marginTop: 4 }}>
                Drop your payment form here from your chosen gateway.
              </Text>
            </View>

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>${totalPrice.toFixed(2)}</Text>
            </View>

            <TouchableOpacity
              onPress={placeOrder}
              style={[styles.primaryBtn, { marginTop: 12, paddingVertical: 14 }]}
              disabled={items.length === 0}
            >
              <Text style={styles.btnText}>
                {items.length === 0 ? "Add items to continue" : "Place Order"}
              </Text>
            </TouchableOpacity>
          </View>
        }
      />
    </SafeAreaView>
  );
}

/* ----------------------------- Widgets ------------------------------ */
function CartButton({ onPress, count }) {
  return (
    <TouchableOpacity onPress={onPress} style={{ paddingHorizontal: 6 }}>
      <View>
        <Text style={{ fontSize: 20 }}>🛒</Text>
        {count > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{count}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

/* ----------------------------- App Root ----------------------------- */
export default function App() {
  return (
    <CartProvider>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="Products" component={ProductsScreen} />
          <Stack.Screen name="Checkout" component={CheckoutScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </CartProvider>
  );
}

/* ----------------------------- Styles ------------------------------- */
const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  title: { fontSize: 16, fontWeight: "600" },
  price: { marginTop: 6, color: "#555" },
  primaryBtn: {
    backgroundColor: "#111827",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  btnText: { color: "#fff", fontWeight: "700" },
  badge: {
    position: "absolute",
    top: -6,
    right: -10,
    backgroundColor: "#ef4444",
    borderRadius: 10,
    paddingHorizontal: 6,
    minWidth: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: { color: "#fff", fontSize: 12, fontWeight: "700" },
  sectionHeader: { fontSize: 18, fontWeight: "700", paddingVertical: 12 },
  cartRow: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1,
  },
  cartTitle: { fontSize: 15, fontWeight: "600" },
  cartSubtitle: { color: "#666", marginTop: 2 },
  qtyBox: { flexDirection: "row", alignItems: "center", marginHorizontal: 6 },
  qtyBtn: {
    width: 30, height: 30, borderRadius: 6, alignItems: "center", justifyContent: "center",
    borderWidth: 1, borderColor: "#ddd",
  },
  qtyBtnText: { fontSize: 18, fontWeight: "700" },
  qtyText: { width: 28, textAlign: "center", fontWeight: "700" },
  cardFormPlaceholder: {
    borderWidth: 1, borderStyle: "dashed", borderColor: "#bbb",
    padding: 16, borderRadius: 12, backgroundColor: "#fafafa",
  },
  totalRow: {
    flexDirection: "row", justifyContent: "space-between",
    marginTop: 16, alignItems: "center",
  },
  totalLabel: { fontSize: 16, fontWeight: "700" },
  totalValue: { fontSize: 18, fontWeight: "800" },
});
