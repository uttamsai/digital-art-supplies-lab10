import { useState } from 'react'
import { HashRouter, Routes, Route } from 'react-router-dom'
import NavBar from './components/NavBar.jsx'
import Footer from './components/Footer.jsx'
import HomeView from './views/HomeView.jsx'
import ShopView from './views/ShopView.jsx'
import ProductDetailView from './views/ProductDetailView.jsx'
import AccountView from './views/AccountView.jsx'
import CreateAccountView from './views/CreateAccountView.jsx'
import CustomersView from './views/CustomersView.jsx'
import CartView from './views/CartView.jsx'
import products from './data/products.json'
import { makeCartItemId, calcItemCount } from './utils/cart.js'

function App() {
  // React state holding the shopping cart. Lifted to App (the common parent)
  // so the nav bar badge, the product detail "Add to Cart" action, and the
  // Cart/CartItem views all read and write the same cart data.
  const [cartItems, setCartItems] = useState([])

  function addToCart({ product, size, color, quantity }) {
    const cartItemId = makeCartItemId(product.id, size, color)

    setCartItems((prev) => {
      const existing = prev.find((item) => item.cartItemId === cartItemId)
      if (existing) {
        return prev.map((item) =>
          item.cartItemId === cartItemId
            ? { ...item, quantity: item.quantity + quantity }
            : item,
        )
      }
      return [
        ...prev,
        {
          cartItemId,
          productId: product.id,
          name: product.name,
          image: product.image,
          imageFallback: product.imageFallback,
          size,
          color,
          quantity,
          unitPrice: product.salePrice ?? product.price,
        },
      ]
    })
  }

  function increaseQuantity(cartItemId) {
    setCartItems((prev) =>
      prev.map((item) =>
        item.cartItemId === cartItemId
          ? { ...item, quantity: item.quantity + 1 }
          : item,
      ),
    )
  }

  function decreaseQuantity(cartItemId) {
    setCartItems((prev) =>
      prev
        .map((item) =>
          item.cartItemId === cartItemId
            ? { ...item, quantity: item.quantity - 1 }
            : item,
        )
        // Prevent invalid (zero or negative) quantities by dropping the item
        // once it would fall below 1.
        .filter((item) => item.quantity > 0),
    )
  }

  function removeFromCart(cartItemId) {
    setCartItems((prev) => prev.filter((item) => item.cartItemId !== cartItemId))
  }

  const cartCount = calcItemCount(cartItems)

  return (
    <HashRouter>
      <div className="d-flex flex-column min-vh-100">
        <NavBar cartCount={cartCount} />
        <main className="flex-grow-1">
          <Routes>
            <Route path="/" element={<HomeView />} />
            <Route path="/shop" element={<ShopView products={products} />} />
            <Route
              path="/product/:productId"
              element={<ProductDetailView products={products} onAddToCart={addToCart} />}
            />
            <Route path="/account" element={<AccountView />} />
            <Route path="/account/create" element={<CreateAccountView />} />
            <Route path="/customers" element={<CustomersView />} />
            <Route
              path="/cart"
              element={
                <CartView
                  cartItems={cartItems}
                  onIncrease={increaseQuantity}
                  onDecrease={decreaseQuantity}
                  onRemove={removeFromCart}
                />
              }
            />
          </Routes>
        </main>
        <Footer />
      </div>
    </HashRouter>
  )
}

export default App
