
# Digital Art Supplies — Code Notes

## Database flow

Create Account form → POST request → Express server → MongoDB Atlas

MongoDB Atlas → Express server → GET response → Customers page

The browser does not connect directly to MongoDB. The server handles the database connection.

## Main database files

- `server/index.js` — The Node.js and Express server. It reads `MONGODB_URI`, creates a MongoDB client, saves new customers with `insertOne`, and reads customers for the list page.
- `src/views/CreateAccountView.jsx` — The signup form. It checks the fields and sends login, email, and password to the server with a POST request.
- `src/views/CustomersView.jsx` — Sends a GET request to the server and displays the returned customer names. Its Refresh button requests the list again.
- `.env` — Contains the private Atlas connection string. Do not share, upload, or show it in the video.
- `.env.example` — Shows the environment variable names without real credentials.

## Website files

- `src/App.jsx` — Defines the website routes and manages shopping-cart state.
- `src/main.jsx` — Starts the React app and loads Bootstrap and the site styles.
- `src/components/NavBar.jsx` — Top navigation, including the Customers link.
- `src/views/AccountView.jsx` — Log In page. Login is still a demo and does not check Atlas.
- `src/views/HomeView.jsx` — Home page and featured products.
- `src/views/ShopView.jsx` — Product list, search, filters, and pagination.
- `src/views/ProductDetailView.jsx` — Product details and Add to Cart.
- `src/views/CartView.jsx` — Cart page.
- `src/components/ProductList.jsx` — Product grid.
- `src/components/ProductCard.jsx` — One product card.
- `src/components/Pagination.jsx` — Product page controls.
- `src/components/Cart.jsx` and `CartItem.jsx` — Cart summary and individual items.
- `src/components/Footer.jsx` — Site footer.
- `src/data/products.json` — Static product data; products are not stored in MongoDB.
- `src/utils/cart.js` — Cart calculations.
- `src/utils/images.js` — Product-image helpers.
- `src/styles/index.css` — Site styling.
- `src/assets/images/` — Product images.

## Setup files

- `package.json` — Dependencies and commands such as `npm run dev`, `npm run dev:server`, and `npm start`.
- `package-lock.json` — Exact installed dependency versions.
- `vite.config.js` — Frontend build settings.
- `index.html` — HTML entry point for the React app.
- `.gitignore` and `.gcloudignore` — Keep files such as `.env` and `node_modules` out of Git or cloud source uploads.

## Important limits

- The Customers page displays all customer names; it does not stop at ten.
- The Log In form does not authenticate users.
- This class demo stores fictional customer passwords as plain text. Use only throwaway passwords and keep them out of the video.
- The current work is local; the public website has not been updated yet.
