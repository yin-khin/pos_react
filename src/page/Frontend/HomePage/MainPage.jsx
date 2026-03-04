// import React, { useEffect, useState } from "react";
// import request from "../../../utils/request";

// const API_BASE_URL = "http://localhost:3000";
// const FALLBACK_IMAGE =
// 	"https://lh3.googleusercontent.com/aida-public/AB6AXuDnWA3R0m9y899YwaQX4jlS5mV4KX6meTGi-yj1WuvXRENDDVctlhO0L8h93LpGw-tyxtts1ijDVWO0oeSIKTst-rTLd62zYBvYBe8CKlgb4qkfSHhWiNeVFQXqVllZ4r8Vphat_twk9Pdo8gHWXQgrnb4g3E2rcZaQfXfHUIbHyZ9enuqdnk3Xoc5T7E04NV6sz5tG443BmRin00wyQCqWm9KGRehLMH9kDXGgdvQKBXBT0H_bnfz5ORjpSPBGIpCkKD_ik-tl5dwL";

// const formatPrice = (value) => {
// 	const amount = Number(value || 0);
// 	return `$${amount.toFixed(2)}`;
// };

// const MainPage = () => {
// 	const [products, setProducts] = useState([]);
// 	const [isLoading, setIsLoading] = useState(true);
// 	const [errorMessage, setErrorMessage] = useState("");

// 	useEffect(() => {
// 		const loadProducts = async () => {
// 			try {
// 				setIsLoading(true);
// 				setErrorMessage("");

// 				const response = await request("/api/products", "GET");
// 				const rows = response.success && response.products ? response.products : [];

// 				const mappedProducts = rows.map((item) => ({
// 					id: item.prd_id,
// 					brand: item.brand_id || "Generic Brand",
// 					name: item.prd_name || item.prd_id || "Unnamed Product",
// 					price: formatPrice(item.unit_cost),
// 					rating: ["star", "star", "star", "star", "star"],
// 					lastStarMuted: true,
// 					image: item.photo ? `${API_BASE_URL}${item.photo}` : FALLBACK_IMAGE,
// 					alt: item.prd_name || "Product image",
// 				}));

// 				setProducts(mappedProducts);
// 			} catch (error) {
// 				setErrorMessage(
// 					error?.response?.data?.message || "Cannot load products from API"
// 				);
// 				setProducts([]);
// 			} finally {
// 				setIsLoading(false);
// 			}
// 		};

// 		loadProducts();
// 	}, []);

// 	return (
// 		<div className="relative flex min-h-screen w-full flex-col bg-background-light font-display text-text-light dark:bg-background-dark dark:text-text-dark">
// 			<header className="sticky top-0 z-50 flex items-center justify-center whitespace-nowrap border-b border-border-light bg-background-light/80 backdrop-blur-sm dark:border-border-dark dark:bg-background-dark/80">
// 				<div className="container mx-auto flex items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
// 					<div className="flex items-center gap-8">
// 						<div className="flex items-center gap-3 text-primary dark:text-white">
// 							<span className="material-symbols-outlined text-2xl">storefront</span>
// 							<h1 className="text-xl font-bold">Shopify</h1>
// 						</div>
// 						<nav className="hidden items-center gap-8 md:flex">
// 							<a className="text-sm font-medium hover:text-accent dark:hover:text-accent" href="#">Home</a>
// 							<a className="text-sm font-medium hover:text-accent dark:hover:text-accent" href="#">Shop</a>
// 							<a className="text-sm font-medium hover:text-accent dark:hover:text-accent" href="#">About</a>
// 						</nav>
// 					</div>
// 					<div className="flex flex-1 items-center justify-end gap-4">
// 						<div className="relative hidden w-full max-w-xs items-center sm:flex">
// 							<span className="material-symbols-outlined absolute left-3 text-subtle-light dark:text-subtle-dark">search</span>
// 							<input
// 								className="w-full rounded-lg border-border-light bg-card-light py-2 pl-10 pr-4 text-sm focus:border-accent focus:ring-accent dark:border-border-dark dark:bg-card-dark"
// 								placeholder="Search products..."
// 								type="text"
// 							/>
// 						</div>
// 						<button className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-black/5 dark:hover:bg-white/5">
// 							<span className="material-symbols-outlined">person</span>
// 						</button>
// 						<button className="relative flex h-10 w-10 items-center justify-center rounded-lg hover:bg-black/5 dark:hover:bg-white/5">
// 							<span className="material-symbols-outlined">favorite</span>
// 							<span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-xs font-bold text-white">2</span>
// 						</button>
// 						<button className="relative flex h-10 w-10 items-center justify-center rounded-lg hover:bg-black/5 dark:hover:bg-white/5">
// 							<span className="material-symbols-outlined">shopping_bag</span>
// 							<span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-xs font-bold text-white">3</span>
// 						</button>
// 					</div>
// 				</div>
// 			</header>

// 			<main className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
// 				<section className="mb-12">
// 					<div
// 						className="relative flex min-h-[400px] items-center justify-center rounded-xl bg-cover bg-center bg-no-repeat p-8 text-center"
// 						style={{
// 							backgroundImage:
// 								'linear-gradient(rgba(0, 0, 0, 0.2) 0%, rgba(0, 0, 0, 0.5) 100%), url("https://lh3.googleusercontent.com/aida-public/AB6AXuDAxXKQEL1_G40VZBFQGNGnf0Rhr4ocKtoDfxlJeYVf4uLXN3u8qN1E6BFSq3VHwgCwWqqV69pny9qaPsw_gn_MH_QkPxfO_A4Y_ZsFOarxVR-wBjIM3rHZfcbSo4nTWg7ACKQ7KsPpr-7j98A_L0sVHclUSlkVCnGDuwtl8D8iOZ2hh-B3D-R3-LPKJA57j6sxyMc_aO8KPnxY2Hg4J5WxdGosOjbeBDIHqvf_8vRtgTjnplwq5AV2plwiRdXfz9qlGoic06bAnBx3")',
// 						}}
// 					>
// 						<div className="flex max-w-2xl flex-col gap-4">
// 							<h2 className="text-4xl font-black leading-tight tracking-tight text-white md:text-5xl">
// 								Summer Collection - Up to 30% Off
// 							</h2>
// 							<p className="text-base text-white/90 md:text-lg">
// 								Discover the latest trends and styles for the season.
// 							</p>
// 							<div className="mt-4">
// 								<button className="flex h-12 items-center justify-center rounded-lg bg-accent px-6 text-base font-bold text-white shadow-lg transition-transform hover:scale-105">
// 									Shop Now
// 								</button>
// 							</div>
// 						</div>
// 					</div>
// 				</section>

// 				<div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
// 					<aside className="col-span-1 lg:col-span-1">
// 						<div className="sticky top-24">
// 							<h3 className="mb-4 text-xl font-bold">Filters</h3>
// 							<div className="space-y-6">
// 								<details className="group" open>
// 									<summary className="flex cursor-pointer items-center justify-between py-2 font-medium">
// 										Category
// 										<span className="material-symbols-outlined transition-transform group-open:rotate-180">expand_more</span>
// 									</summary>
// 									<div className="space-y-2 pt-2">
// 										<label className="flex items-center gap-2"><input defaultChecked className="rounded border-border-light text-accent focus:ring-accent" type="checkbox" /> T-Shirts</label>
// 										<label className="flex items-center gap-2"><input className="rounded border-border-light text-accent focus:ring-accent" type="checkbox" /> Hoodies</label>
// 										<label className="flex items-center gap-2"><input className="rounded border-border-light text-accent focus:ring-accent" type="checkbox" /> Jeans</label>
// 										<label className="flex items-center gap-2"><input className="rounded border-border-light text-accent focus:ring-accent" type="checkbox" /> Shoes</label>
// 									</div>
// 								</details>

// 								<div className="border-t border-border-light pt-6 dark:border-border-dark">
// 									<p className="mb-4 font-medium">Price Range</p>
// 									<div className="relative h-1 w-full rounded-full bg-border-light dark:bg-border-dark">
// 										<div className="absolute h-1 rounded-full bg-primary dark:bg-accent" style={{ left: "10%", right: "30%" }} />
// 										<div className="absolute -top-1.5" style={{ left: "10%" }}>
// 											<div className="h-4 w-4 cursor-pointer rounded-full border-2 border-background-light bg-primary dark:border-background-dark dark:bg-accent" />
// 											<span className="absolute left-1/2 top-5 -translate-x-1/2 text-sm text-subtle-light dark:text-subtle-dark">$50</span>
// 										</div>
// 										<div className="absolute -top-1.5" style={{ right: "30%" }}>
// 											<div className="h-4 w-4 cursor-pointer rounded-full border-2 border-background-light bg-primary dark:border-background-dark dark:bg-accent" />
// 											<span className="absolute left-1/2 top-5 -translate-x-1/2 text-sm text-subtle-light dark:text-subtle-dark">$350</span>
// 										</div>
// 									</div>
// 								</div>

// 								<details className="group border-t border-border-light pt-6 dark:border-border-dark" open>
// 									<summary className="flex cursor-pointer items-center justify-between py-2 font-medium">
// 										Brand
// 										<span className="material-symbols-outlined transition-transform group-open:rotate-180">expand_more</span>
// 									</summary>
// 									<div className="space-y-2 pt-2">
// 										<label className="flex items-center gap-2"><input className="rounded border-border-light text-accent focus:ring-accent" type="checkbox" /> Nike</label>
// 										<label className="flex items-center gap-2"><input defaultChecked className="rounded border-border-light text-accent focus:ring-accent" type="checkbox" /> Adidas</label>
// 										<label className="flex items-center gap-2"><input defaultChecked className="rounded border-border-light text-accent focus:ring-accent" type="checkbox" /> Puma</label>
// 										<label className="flex items-center gap-2"><input className="rounded border-border-light text-accent focus:ring-accent" type="checkbox" /> Levi's</label>
// 									</div>
// 								</details>

// 								<div className="flex gap-4 border-t border-border-light pt-6 dark:border-border-dark">
// 									<button className="w-full rounded-lg bg-accent py-2.5 text-sm font-bold text-white">Apply Filters</button>
// 									<button className="w-full rounded-lg bg-border-light py-2.5 text-sm font-bold text-text-light dark:bg-border-dark dark:text-text-dark">Reset</button>
// 								</div>
// 							</div>
// 						</div>
// 					</aside>

// 					<div className="col-span-1 lg:col-span-3">
// 						<div className="mb-6 flex flex-col items-center justify-between gap-4 sm:flex-row">
// 							<p className="text-sm text-subtle-light dark:text-subtle-dark">
// 								Showing {products.length} results
// 							</p>
// 							<div className="flex items-center gap-2">
// 								<label className="text-sm font-medium" htmlFor="sort">Sort by:</label>
// 								<select className="rounded-lg border-border-light bg-card-light text-sm focus:border-accent focus:ring-accent dark:border-border-dark dark:bg-card-dark" id="sort">
// 									<option>Newest</option>
// 									<option>Price: Low to High</option>
// 									<option>Price: High to Low</option>
// 									<option>Top Rated</option>
// 								</select>
// 							</div>
// 						</div>

// 						{isLoading && (
// 							<p className="mb-4 text-sm text-subtle-light dark:text-subtle-dark">
// 								Loading products...
// 							</p>
// 						)}
// 						{!isLoading && errorMessage && (
// 							<p className="mb-4 text-sm text-red-500">{errorMessage}</p>
// 						)}

// 						<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
// 							{products.map((item) => (
// 								<div
// 									key={item.id}
// 									className="group relative flex flex-col overflow-hidden rounded-xl bg-card-light shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:bg-card-dark"
// 								>
// 									<a className="flex flex-grow flex-col" href="#">
// 										<div className="aspect-square w-full overflow-hidden">
// 											<img className="h-full w-full object-cover transition-transform group-hover:scale-105" src={item.image} alt={item.alt} />
// 										</div>
// 										<div className="flex flex-grow flex-col p-4">
// 											<h4 className="text-sm text-subtle-light dark:text-subtle-dark">{item.brand}</h4>
// 											<h3 className="mt-1 truncate text-lg font-bold">{item.name}</h3>
// 											<div className="my-2 flex items-center gap-1 text-accent">
// 												{item.rating.map((icon, index) => (
// 													<span
// 														key={`${item.name}-${icon}-${index}`}
// 														className={`material-symbols-outlined !text-base !font-bold ${item.lastStarMuted && index === 4 ? "text-border-light dark:text-border-dark" : ""}`}
// 													>
// 														{icon}
// 													</span>
// 												))}
// 											</div>
// 											<p className="mt-auto pt-2 text-xl font-bold">{item.price}</p>
// 										</div>
// 									</a>
// 									<button
// 										aria-label="Add to cart"
// 										className="absolute bottom-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-accent text-white opacity-0 transition-opacity group-hover:opacity-100"
// 									>
// 										<span className="material-symbols-outlined">add_shopping_cart</span>
// 									</button>
// 								</div>
// 							))}
// 						</div>

// 						{!isLoading && !errorMessage && products.length === 0 && (
// 							<p className="mt-4 text-sm text-subtle-light dark:text-subtle-dark">
// 								No products available.
// 							</p>
// 						)}

// 						<nav className="mt-12 flex items-center justify-center gap-2">
// 							<button className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-black/5 disabled:opacity-50 dark:hover:bg-white/5" disabled>
// 								<span className="material-symbols-outlined">chevron_left</span>
// 							</button>
// 							<button className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-sm font-bold text-white">1</button>
// 							<button className="flex h-10 w-10 items-center justify-center rounded-lg text-sm font-medium hover:bg-black/5 dark:hover:bg-white/5">2</button>
// 							<button className="flex h-10 w-10 items-center justify-center rounded-lg text-sm font-medium hover:bg-black/5 dark:hover:bg-white/5">3</button>
// 							<span className="text-sm">...</span>
// 							<button className="flex h-10 w-10 items-center justify-center rounded-lg text-sm font-medium hover:bg-black/5 dark:hover:bg-white/5">8</button>
// 							<button className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-black/5 dark:hover:bg-white/5">
// 								<span className="material-symbols-outlined">chevron_right</span>
// 							</button>
// 						</nav>
// 					</div>
// 				</div>
// 			</main>

// 			<footer className="mt-auto border-t border-border-light bg-card-light dark:border-border-dark dark:bg-card-dark">
// 				<div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
// 					<div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
// 						<div className="col-span-2 lg:col-span-1">
// 							<div className="mb-4 flex items-center gap-3 text-primary dark:text-white">
// 								<span className="material-symbols-outlined text-2xl">storefront</span>
// 								<h1 className="text-xl font-bold">Shopify</h1>
// 							</div>
// 							<p className="text-sm text-subtle-light dark:text-subtle-dark">
// 								Your one-stop shop for the latest trends in fashion and apparel.
// 							</p>
// 						</div>

// 						<div>
// 							<h4 className="mb-4 font-bold">Shop</h4>
// 							<ul className="space-y-2 text-sm text-subtle-light dark:text-subtle-dark">
// 								<li><a className="hover:text-accent" href="#">New Arrivals</a></li>
// 								<li><a className="hover:text-accent" href="#">Men</a></li>
// 								<li><a className="hover:text-accent" href="#">Women</a></li>
// 								<li><a className="hover:text-accent" href="#">Accessories</a></li>
// 							</ul>
// 						</div>

// 						<div>
// 							<h4 className="mb-4 font-bold">About Us</h4>
// 							<ul className="space-y-2 text-sm text-subtle-light dark:text-subtle-dark">
// 								<li><a className="hover:text-accent" href="#">Our Story</a></li>
// 								<li><a className="hover:text-accent" href="#">Careers</a></li>
// 								<li><a className="hover:text-accent" href="#">Press</a></li>
// 							</ul>
// 						</div>

// 						<div>
// 							<h4 className="mb-4 font-bold">Support</h4>
// 							<ul className="space-y-2 text-sm text-subtle-light dark:text-subtle-dark">
// 								<li><a className="hover:text-accent" href="#">Contact Us</a></li>
// 								<li><a className="hover:text-accent" href="#">FAQ</a></li>
// 								<li><a className="hover:text-accent" href="#">Shipping &amp; Returns</a></li>
// 							</ul>
// 						</div>

// 						<div>
// 							<h4 className="mb-4 font-bold">Follow Us</h4>
// 							<div className="flex gap-4">
// 								<a className="text-subtle-light hover:text-accent dark:text-subtle-dark" href="#" aria-label="Twitter">
// 									<svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
// 										<path d="M22.46,6C21.69,6.35 20.86,6.58 20,6.69C20.88,6.16 21.56,5.32 21.88,4.31C21.05,4.81 20.13,5.16 19.16,5.36C18.37,4.5 17.26,4 16,4C13.65,4 11.73,5.92 11.73,8.29C11.73,8.63 11.77,8.96 11.84,9.27C8.28,9.09 5.11,7.38 2.9,4.79C2.53,5.42 2.33,6.15 2.33,6.94C2.33,8.43 3.08,9.77 4.19,10.59C3.49,10.57 2.82,10.37 2.2,10.03C2.2,10.05 2.2,10.07 2.2,10.08C2.2,12.24 3.73,14.05 5.82,14.48C5.46,14.58 5.08,14.61 4.69,14.61C4.42,14.61 4.15,14.58 3.89,14.53C4.45,16.29 6.13,17.56 8.12,17.6C6.63,18.78 4.75,19.5 2.75,19.5C2.41,19.5 2.07,19.48 1.75,19.44C3.76,20.75 6.1,21.5 8.6,21.5C16,21.5 20.33,15.48 20.33,10.03C20.33,9.84 20.33,9.65 20.32,9.46C21.1,8.88 21.83,8.18 22.46,7.34V7.33L22.46,6Z" />
// 									</svg>
// 								</a>
// 								<a className="text-subtle-light hover:text-accent dark:text-subtle-dark" href="#" aria-label="Instagram">
// 									<svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
// 										<path d="M12,2.04C6.5,2.04 2.04,6.5 2.04,12C2.04,17.5 6.5,21.96 12,21.96C17.5,21.96 21.96,17.5 21.96,12C21.96,6.5 17.5,2.04 12,2.04M12,20.15C7.5,20.15 3.85,16.5 3.85,12C3.85,7.5 7.5,3.85 12,3.85C16.5,3.85 20.15,7.5 20.15,12C20.15,16.5 16.5,20.15 12,20.15M12,7.38C9.43,7.38 7.38,9.43 7.38,12C7.38,14.57 9.43,16.62 12,16.62C14.57,16.62 16.62,14.57 16.62,12C16.62,9.43 14.57,7.38 12,7.38M12,14.81C10.45,14.81 9.19,13.55 9.19,12C9.19,10.45 10.45,9.19 12,9.19C13.55,9.19 14.81,10.45 14.81,12C14.81,13.55 13.55,14.81 12,14.81M16.96,6.22C16.96,5.77 16.6,5.41 16.15,5.41C15.7,5.41 15.34,5.77 15.34,6.22C15.34,6.67 15.7,7.03 16.15,7.03C16.6,7.03 16.96,6.67 16.96,6.22Z" />
// 									</svg>
// 								</a>
// 							</div>
// 						</div>
// 					</div>

// 					<div className="mt-8 border-t border-border-light pt-8 text-center text-sm text-subtle-light dark:border-border-dark dark:text-subtle-dark">
// 						<p>© 2024 Shopify. All rights reserved.</p>
// 					</div>
// 				</div>
// 			</footer>
// 		</div>
// 	);
// };

// export default MainPage;


import React, { useEffect, useState } from "react";
import request from "../../../utils/request";

const API_BASE_URL = "http://localhost:3000";
const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600&q=80";

const formatPrice = (v) => `$${Number(v || 0).toFixed(2)}`;

/* ─── Inline SVG Icons (no external font dependency) ─── */
const Icons = {
  Store: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4v2l-2 5v2h1v7h18v-7h1v-2l-2-5V4zm-2 14H6v-5h12v5zm1.2-7H4.8l1.2-3h12l1.2 3z"/></svg>,
  Search: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  Person: () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  Heart: ({ solid }) => <svg width="17" height="17" viewBox="0 0 24 24" fill={solid ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
  Bag: () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>,
  Arrow: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
  Plus: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  ChevLeft: () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>,
  ChevRight: () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>,
  Star: ({ on }) => <svg width="11" height="11" viewBox="0 0 24 24" fill={on ? "#c9a84c" : "none"} stroke={on ? "#c9a84c" : "#2e2810"} strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  Filter: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>,
  Twitter: () => <svg width="17" height="17" fill="currentColor" viewBox="0 0 24 24"><path d="M22.46 6a8.07 8.07 0 0 1-2.35.64 4.1 4.1 0 0 0 1.8-2.27 8.2 8.2 0 0 1-2.6.99 4.1 4.1 0 0 0-7 3.74A11.64 11.64 0 0 1 3.39 4.62a4.1 4.1 0 0 0 1.27 5.47 4.04 4.04 0 0 1-1.86-.51v.05a4.1 4.1 0 0 0 3.29 4.02 4.1 4.1 0 0 1-1.85.07 4.1 4.1 0 0 0 3.83 2.85A8.23 8.23 0 0 1 2 18.43a11.6 11.6 0 0 0 6.29 1.84c7.55 0 11.68-6.26 11.68-11.68l-.01-.53A8.31 8.31 0 0 0 22.46 6z"/></svg>,
  Instagram: () => <svg width="17" height="17" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>,
};

/* ─── CSS ─── */
const css = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400;1,600&family=Inter:wght@300;400;500;600&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
.sp{font-family:'Inter',sans-serif;background:#0d0d0d;color:#e2ddd6;min-height:100vh;}

/* HEADER */
.sp-hdr{position:sticky;top:0;z-index:100;height:66px;display:flex;align-items:center;
  background:rgba(13,13,13,.92);backdrop-filter:blur(24px);
  border-bottom:1px solid rgba(201,168,76,.12);}
.sp-hdr-in{max-width:1380px;margin:0 auto;width:100%;padding:0 2rem;
  display:flex;align-items:center;justify-content:space-between;gap:1.5rem;}
.sp-logo{display:flex;align-items:center;gap:0.55rem;text-decoration:none;flex-shrink:0;}
.sp-logo-icon{color:#c9a84c;display:flex;}
.sp-logo-text{font-family:'Playfair Display',serif;font-size:1.2rem;font-weight:700;
  letter-spacing:.14em;text-transform:uppercase;
  background:linear-gradient(135deg,#c9a84c,#e8c96a,#a07830);
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}
.sp-logo-sub{font-size:.58rem;letter-spacing:.3em;text-transform:uppercase;color:#444;
  font-weight:500;display:block;margin-top:-1px;}
.sp-nav{display:flex;gap:2rem;align-items:center;}
.sp-nav a{font-size:.68rem;letter-spacing:.18em;text-transform:uppercase;color:#777;
  font-weight:500;text-decoration:none;transition:color .25s;position:relative;}
.sp-nav a::after{content:'';position:absolute;bottom:-4px;left:0;width:0;height:1px;
  background:#c9a84c;transition:width .3s;}
.sp-nav a:hover{color:#c9a84c;}.sp-nav a:hover::after{width:100%;}
.sp-srch{position:relative;display:flex;align-items:center;flex:1;max-width:260px;}
.sp-srch-ic{position:absolute;left:11px;color:#555;pointer-events:none;display:flex;}
.sp-srch input{width:100%;background:rgba(255,255,255,.04);border:1px solid rgba(201,168,76,.14);
  border-radius:6px;padding:.48rem 1rem .48rem 2.2rem;font-size:.76rem;color:#e2ddd6;
  font-family:'Inter',sans-serif;letter-spacing:.04em;transition:border-color .25s,background .25s;}
.sp-srch input::placeholder{color:#3a3a3a;}
.sp-srch input:focus{outline:none;border-color:rgba(201,168,76,.38);background:rgba(255,255,255,.06);}
.sp-ics{display:flex;align-items:center;gap:.2rem;}
.sp-ic{width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;
  background:transparent;border:none;cursor:pointer;color:#777;position:relative;
  transition:color .25s,background .25s;}
.sp-ic:hover{color:#c9a84c;background:rgba(201,168,76,.08);}
.sp-badge{position:absolute;top:4px;right:4px;width:15px;height:15px;border-radius:50%;
  background:#c9a84c;color:#0d0d0d;font-size:8.5px;font-weight:700;
  display:flex;align-items:center;justify-content:center;}

/* HERO */
.sp-hero{position:relative;overflow:hidden;min-height:510px;display:flex;align-items:flex-end;}
.sp-hero-bg{position:absolute;inset:0;
  background-image:
    linear-gradient(to right,rgba(13,13,13,.88) 0%,rgba(13,13,13,.5) 55%,rgba(13,13,13,.1) 100%),
    linear-gradient(to top,rgba(13,13,13,.55) 0%,transparent 50%),
    url("https://lh3.googleusercontent.com/aida-public/AB6AXuDAxXKQEL1_G40VZBFQGNGnf0Rhr4ocKtoDfxlJeYVf4uLXN3u8qN1E6BFSq3VHwgCwWqqV69pny9qaPsw_gn_MH_QkPxfO_A4Y_ZsFOarxVR-wBjIM3rHZfcbSo4nTWg7ACKQ7KsPpr-7j98A_L0sVHclUSlkVCnGDuwtl8D8iOZ2hh-B3D-R3-LPKJA57j6sxyMc_aO8KPnxY2Hg4J5WxdGosOjbeBDIHqvf_8vRtgTjnplwq5AV2plwiRdXfz9qlGoic06bAnBx3");
  background-size:cover;background-position:center;
  transition:transform 10s ease;}
.sp-hero:hover .sp-hero-bg{transform:scale(1.04);}
.sp-hero-cnt{position:relative;z-index:2;padding:4rem 3.5rem;max-width:600px;}
.sp-hero-tag{display:inline-flex;align-items:center;gap:.5rem;
  font-size:.6rem;letter-spacing:.3em;text-transform:uppercase;
  color:#c9a84c;font-weight:600;margin-bottom:1.2rem;}
.sp-hero-dot{width:4px;height:4px;border-radius:50%;background:#c9a84c;}
.sp-hero-h{font-family:'Playfair Display',serif;
  font-size:clamp(3rem,5.5vw,5rem);font-weight:400;line-height:1.05;
  color:#f5f0e8;margin-bottom:.9rem;}
.sp-hero-h em{font-style:italic;color:#c9a84c;}
.sp-hero-p{font-size:.88rem;color:rgba(226,221,214,.6);line-height:1.78;
  margin-bottom:2rem;max-width:400px;font-weight:300;}
.sp-hero-acts{display:flex;align-items:center;gap:1.25rem;}
.sp-btn-g{display:inline-flex;align-items:center;gap:.6rem;
  background:#c9a84c;color:#0d0d0d;border:none;cursor:pointer;
  padding:.88rem 1.7rem;font-size:.67rem;letter-spacing:.2em;text-transform:uppercase;
  font-weight:700;font-family:'Inter',sans-serif;border-radius:3px;
  transition:transform .25s,box-shadow .25s,background .25s;
  box-shadow:0 4px 24px rgba(201,168,76,.28);}
.sp-btn-g:hover{background:#dbbe5e;transform:translateY(-2px);box-shadow:0 8px 32px rgba(201,168,76,.38);}
.sp-btn-g svg{transition:transform .3s;}.sp-btn-g:hover svg{transform:translateX(3px);}
.sp-btn-o{font-size:.67rem;letter-spacing:.18em;text-transform:uppercase;color:rgba(226,221,214,.45);
  font-weight:500;background:none;border:none;cursor:pointer;font-family:'Inter',sans-serif;
  transition:color .25s;text-decoration:underline;text-underline-offset:4px;
  text-decoration-color:rgba(201,168,76,.25);}
.sp-btn-o:hover{color:#c9a84c;}

/* LAYOUT */
.sp-main{max-width:1380px;margin:0 auto;padding:3rem 2rem;}
.sp-lay{display:grid;grid-template-columns:238px 1fr;gap:3rem;align-items:start;}

/* SIDEBAR */
.sp-sb{position:sticky;top:82px;}
.sp-sb-title{font-family:'Playfair Display',serif;font-size:1.45rem;font-weight:400;
  color:#e2ddd6;margin-bottom:2rem;display:flex;align-items:center;gap:.65rem;}
.sp-sb-title svg{color:#c9a84c;}
.sp-fs{border-bottom:1px solid rgba(201,168,76,.07);padding-bottom:1.4rem;margin-bottom:1.4rem;}
.sp-fl{font-size:.57rem;letter-spacing:.25em;text-transform:uppercase;
  color:#c9a84c;font-weight:600;margin-bottom:.9rem;display:block;}
.sp-ci{display:flex;align-items:center;gap:.7rem;padding:.28rem 0;cursor:pointer;
  font-size:.8rem;color:#777;transition:color .2s;user-select:none;}
.sp-ci:hover{color:#e2ddd6;}
.sp-ck{width:15px;height:15px;flex-shrink:0;border:1.5px solid rgba(201,168,76,.22);
  border-radius:3px;position:relative;transition:all .2s;}
.sp-ci.on .sp-ck{background:#c9a84c;border-color:#c9a84c;}
.sp-ci.on .sp-ck::after{content:'';position:absolute;top:1px;left:4px;
  width:4px;height:7px;border:2px solid #0d0d0d;border-top:none;border-left:none;transform:rotate(45deg);}
.sp-pt{height:2px;background:rgba(201,168,76,.1);border-radius:9999px;position:relative;margin:1rem 0 2.2rem;}
.sp-pf{position:absolute;height:100%;background:linear-gradient(90deg,#c9a84c,#e8c96a);border-radius:9999px;left:14%;right:24%;}
.sp-ph{position:absolute;top:50%;width:14px;height:14px;border-radius:50%;
  background:#c9a84c;border:2px solid #0d0d0d;box-shadow:0 0 0 3px rgba(201,168,76,.18);cursor:grab;
  transform:translate(-50%,-50%);}
.sp-pl{display:flex;justify-content:space-between;font-size:.68rem;color:#555;letter-spacing:.05em;}
.sp-fbs{display:flex;flex-direction:column;gap:.5rem;margin-top:1.6rem;}
.sp-abt{background:#c9a84c;color:#0d0d0d;border:none;cursor:pointer;padding:.78rem;
  font-size:.61rem;letter-spacing:.2em;text-transform:uppercase;font-weight:700;
  font-family:'Inter',sans-serif;border-radius:4px;transition:opacity .25s,transform .2s;}
.sp-abt:hover{opacity:.88;transform:translateY(-1px);}
.sp-rst{background:transparent;color:#555;border:1px solid rgba(255,255,255,.08);cursor:pointer;
  padding:.78rem;font-size:.61rem;letter-spacing:.2em;text-transform:uppercase;
  font-weight:600;font-family:'Inter',sans-serif;border-radius:4px;transition:all .25s;}
.sp-rst:hover{color:#e2ddd6;border-color:rgba(255,255,255,.18);}

/* PRODUCTS */
.sp-ph2{margin-bottom:2.4rem;}
.sp-eye{font-size:.6rem;letter-spacing:.3em;text-transform:uppercase;color:#c9a84c;font-weight:600;margin-bottom:.35rem;}
.sp-ptitle{font-family:'Playfair Display',serif;font-size:2rem;font-weight:400;color:#e2ddd6;}
.sp-tb{display:flex;align-items:center;justify-content:space-between;
  padding:1rem 0;border-bottom:1px solid rgba(201,168,76,.07);margin-bottom:1.7rem;}
.sp-cnt{font-size:.68rem;letter-spacing:.12em;text-transform:uppercase;color:#444;}
.sp-sw{display:flex;align-items:center;gap:.7rem;}
.sp-slbl{font-size:.66rem;letter-spacing:.12em;text-transform:uppercase;color:#444;}
.sp-sel{background:rgba(255,255,255,.04);border:1px solid rgba(201,168,76,.14);border-radius:4px;
  color:#e2ddd6;font-size:.76rem;padding:.38rem .9rem;font-family:'Inter',sans-serif;cursor:pointer;}
.sp-sel:focus{outline:none;border-color:rgba(201,168,76,.38);}

/* GRID */
.sp-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(215px,1fr));gap:1.2rem;}

/* CARD */
.sp-card{position:relative;background:#131313;border:1px solid rgba(255,255,255,.04);
  border-radius:6px;overflow:hidden;cursor:pointer;
  transition:border-color .35s,transform .35s,box-shadow .35s;}
.sp-card:hover{border-color:rgba(201,168,76,.22);transform:translateY(-5px);
  box-shadow:0 18px 50px rgba(0,0,0,.55),0 0 0 1px rgba(201,168,76,.09);}
.sp-cimw{position:relative;overflow:hidden;aspect-ratio:3/4;background:#1a1a1a;}
.sp-cimg{width:100%;height:100%;object-fit:cover;display:block;
  transition:transform .65s cubic-bezier(.25,.46,.45,.94);}
.sp-card:hover .sp-cimg{transform:scale(1.08);}
.sp-cov{position:absolute;inset:0;
  background:linear-gradient(to top,rgba(19,19,19,.72) 0%,transparent 40%);
  opacity:0;transition:opacity .35s;}
.sp-card:hover .sp-cov{opacity:1;}
.sp-ctag{position:absolute;top:10px;left:10px;z-index:2;
  background:rgba(13,13,13,.78);border:1px solid rgba(201,168,76,.38);color:#c9a84c;
  font-size:.54rem;letter-spacing:.2em;text-transform:uppercase;font-weight:700;
  padding:.2rem .5rem;backdrop-filter:blur(8px);border-radius:2px;}
.sp-cwish{position:absolute;top:10px;right:10px;z-index:2;width:30px;height:30px;
  border-radius:50%;background:rgba(13,13,13,.7);border:1px solid rgba(255,255,255,.07);
  display:flex;align-items:center;justify-content:center;color:#555;cursor:pointer;
  opacity:0;transform:scale(.8);transition:opacity .3s,transform .3s,color .25s,background .25s;
  backdrop-filter:blur(8px);}
.sp-card:hover .sp-cwish{opacity:1;transform:scale(1);}
.sp-cwish:hover,.sp-cwish.on{color:#e05555;background:rgba(224,85,85,.1);border-color:rgba(224,85,85,.25);}
.sp-cwish.on{opacity:1;transform:scale(1);}
.sp-cbody{padding:1rem 1.1rem 1.15rem;}
.sp-cbrand{font-size:.57rem;letter-spacing:.2em;text-transform:uppercase;color:#c9a84c;font-weight:600;}
.sp-cname{font-family:'Playfair Display',serif;font-size:1rem;font-weight:400;
  color:#e2ddd6;margin-top:.18rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;line-height:1.35;}
.sp-cstars{display:flex;gap:2px;margin-top:.55rem;}
.sp-cft{display:flex;align-items:center;justify-content:space-between;
  margin-top:.8rem;padding-top:.8rem;border-top:1px solid rgba(255,255,255,.05);}
.sp-cprice{font-family:'Playfair Display',serif;font-size:1.18rem;font-weight:700;
  color:#e8dfc8;letter-spacing:.01em;}
.sp-cadd{width:32px;height:32px;border-radius:50%;background:rgba(201,168,76,.09);
  border:1px solid rgba(201,168,76,.18);display:flex;align-items:center;justify-content:center;
  color:#c9a84c;cursor:pointer;opacity:0;transform:scale(.7) rotate(-45deg);
  transition:opacity .3s,transform .3s,background .25s;}
.sp-card:hover .sp-cadd{opacity:1;transform:scale(1) rotate(0deg);}
.sp-cadd:hover{background:#c9a84c;color:#0d0d0d;border-color:#c9a84c;}

/* SKELETON */
.sp-sk{background:#131313;border:1px solid rgba(255,255,255,.04);border-radius:6px;overflow:hidden;}
.sp-sk-img{aspect-ratio:3/4;}
.sp-sh{background:linear-gradient(90deg,#181818 25%,#202020 50%,#181818 75%);background-size:200% 100%;animation:sh 1.6s infinite;}
@keyframes sh{0%{background-position:200% 0}100%{background-position:-200% 0}}
.sp-sk-bd{padding:1rem 1.1rem;}
.sp-sk-ln{height:8px;border-radius:9999px;margin-top:8px;}

/* EMPTY/ERROR */
.sp-empty{text-align:center;padding:5rem 1rem;font-size:.78rem;letter-spacing:.12em;
  text-transform:uppercase;color:#3a3a3a;}
.sp-err{color:#b04040;font-size:.78rem;letter-spacing:.05em;margin-bottom:1.5rem;
  padding:1rem;border:1px solid rgba(192,80,80,.18);border-radius:4px;background:rgba(192,80,80,.05);}

/* PAGINATION */
.sp-pag{display:flex;align-items:center;justify-content:center;gap:.3rem;margin-top:3.5rem;}
.sp-pb{min-width:38px;height:38px;display:flex;align-items:center;justify-content:center;
  font-size:.76rem;font-weight:500;color:#555;background:transparent;
  border:1px solid transparent;border-radius:4px;cursor:pointer;
  font-family:'Inter',sans-serif;transition:all .25s;}
.sp-pb:hover:not(:disabled){color:#c9a84c;border-color:rgba(201,168,76,.2);}
.sp-pb.a{background:rgba(201,168,76,.1);border-color:rgba(201,168,76,.28);color:#c9a84c;}
.sp-pb:disabled{opacity:.25;cursor:not-allowed;}
.sp-pdots{color:#2e2e2e;font-size:.8rem;padding:0 .25rem;}

/* FOOTER */
.sp-ft{background:#080808;border-top:1px solid rgba(201,168,76,.07);margin-top:6rem;}
.sp-ft-in{max-width:1380px;margin:0 auto;padding:4rem 2rem 2rem;}
.sp-ft-g{display:grid;grid-template-columns:2fr 1fr 1fr 1fr 1fr;gap:3rem;margin-bottom:3rem;}
.sp-ft-desc{font-size:.76rem;color:#2e2010;line-height:1.8;margin-top:.75rem;letter-spacing:.02em;}
.sp-ft-h{font-size:.57rem;letter-spacing:.25em;text-transform:uppercase;color:#c9a84c;font-weight:600;margin-bottom:1.2rem;}
.sp-ft-a{display:block;font-size:.76rem;color:#2e2010;text-decoration:none;
  padding:.2rem 0;transition:color .2s;letter-spacing:.02em;}
.sp-ft-a:hover{color:#777;}
.sp-socs{display:flex;gap:1rem;margin-top:.5rem;}
.sp-soc{color:#2a1e08;transition:color .25s;display:flex;align-items:center;}
.sp-soc:hover{color:#c9a84c;}
.sp-ft-bot{border-top:1px solid rgba(201,168,76,.05);padding-top:2rem;
  display:flex;align-items:center;justify-content:space-between;}
.sp-copy{font-size:.62rem;letter-spacing:.15em;text-transform:uppercase;color:#231808;}
.sp-leg{display:flex;gap:1.5rem;}
.sp-leg a{font-size:.62rem;letter-spacing:.1em;text-transform:uppercase;
  color:#231808;text-decoration:none;transition:color .2s;}
.sp-leg a:hover{color:#555;}

@media(max-width:900px){
  .sp-lay{grid-template-columns:1fr;}
  .sp-sb{position:static;}
  .sp-ft-g{grid-template-columns:1fr 1fr;}
  .sp-nav{display:none;}
}
@media(max-width:580px){
  .sp-hero-cnt{padding:2.5rem 1.5rem;}
  .sp-main{padding:1.5rem 1rem;}
  .sp-ft-g{grid-template-columns:1fr;}
}
`;

/* ─── Sub-components ─── */
const CheckItem = ({ label, defaultChecked }) => {
  const [on, setOn] = useState(!!defaultChecked);
  return (
    <div className={`sp-ci ${on ? "on" : ""}`} onClick={() => setOn(!on)}>
      <span className="sp-ck" />
      {label}
    </div>
  );
};

const WishBtn = () => {
  const [on, setOn] = useState(false);
  return (
    <button
      className={`sp-cwish ${on ? "on" : ""}`}
      aria-label="Wishlist"
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOn(!on); }}
    >
      <Icons.Heart solid={on} />
    </button>
  );
};

const ProductCard = ({ item }) => (
  <div className="sp-card">
    <div className="sp-cimw">
      <img
        className="sp-cimg"
        src={item.image}
        alt={item.alt}
        onError={(e) => { e.target.src = FALLBACK_IMAGE; }}
      />
      <div className="sp-cov" />
      <span className="sp-ctag">New</span>
      <WishBtn />
    </div>
    <div className="sp-cbody">
      <p className="sp-cbrand">{item.brand}</p>
      <h3 className="sp-cname">{item.name}</h3>
      <div className="sp-cstars">
        {[0,1,2,3,4].map(i => <Icons.Star key={i} on={i < 4} />)}
      </div>
      <div className="sp-cft">
        <span className="sp-cprice">{item.price}</span>
        <button className="sp-cadd" aria-label="Add to cart"><Icons.Plus /></button>
      </div>
    </div>
  </div>
);

const SkeletonCard = () => (
  <div className="sp-sk">
    <div className="sp-sk-img sp-sh" />
    <div className="sp-sk-bd">
      <div className="sp-sk-ln sp-sh" style={{ width: "36%" }} />
      <div className="sp-sk-ln sp-sh" style={{ width: "68%", height: 13, marginTop: 10 }} />
      <div className="sp-sk-ln sp-sh" style={{ width: "26%", marginTop: 14 }} />
    </div>
  </div>
);

/* ─── Main Page ─── */
const MainPage = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [activePage, setActivePage] = useState(1);

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        setErrorMessage("");
        const response = await request("/api/products", "GET");
        const rows = response.success && response.products ? response.products : [];
        setProducts(rows.map((item) => ({
          id: item.prd_id,
          brand: item.brand_id || "Generic Brand",
          name: item.prd_name || item.prd_id || "Unnamed Product",
          price: formatPrice(item.unit_cost),
          image: item.photo ? `${API_BASE_URL}${item.photo}` : FALLBACK_IMAGE,
          alt: item.prd_name || "Product image",
        })));
      } catch (err) {
        setErrorMessage(err?.response?.data?.message || "Cannot load products from API");
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  return (
    <>
      <style>{css}</style>
      <div className="sp">

        {/* ── HEADER ── */}
        <header className="sp-hdr">
          <div className="sp-hdr-in">
            <a href="#" className="sp-logo">
              <span className="sp-logo-icon"><Icons.Store /></span>
              <span>
                <span className="sp-logo-text">Shopify</span>
                <span className="sp-logo-sub">Storefront</span>
              </span>
            </a>
            <nav className="sp-nav">
              {["Home","Shop","Collections","About"].map(l => <a key={l} href="#">{l}</a>)}
            </nav>
            <div className="sp-srch">
              <span className="sp-srch-ic"><Icons.Search /></span>
              <input placeholder="Search collection…" type="text" />
            </div>
            <div className="sp-ics">
              <button className="sp-ic"><Icons.Person /></button>
              <button className="sp-ic"><Icons.Heart /><span className="sp-badge">2</span></button>
              <button className="sp-ic"><Icons.Bag /><span className="sp-badge">3</span></button>
            </div>
          </div>
        </header>

        {/* ── HERO ── */}
        <section>
          <div className="sp-hero">
            <div className="sp-hero-bg" />
            <div className="sp-hero-cnt">
              <div className="sp-hero-tag"><span className="sp-hero-dot" />Summer 2024 &nbsp;·&nbsp; Limited Edition</div>
              <h2 className="sp-hero-h">Summer<br /><em>Collection</em></h2>
              <p className="sp-hero-p">Discover curated pieces crafted for the season.<br />Up to 30% off selected styles.</p>
              <div className="sp-hero-acts">
                <button className="sp-btn-g">Explore Now &nbsp;<Icons.Arrow /></button>
                <button className="sp-btn-o">View Lookbook</button>
              </div>
            </div>
          </div>
        </section>

        {/* ── MAIN ── */}
        <main className="sp-main">
          <div className="sp-lay">

            {/* SIDEBAR */}
            <aside className="sp-sb">
              <h3 className="sp-sb-title"><Icons.Filter /> Refine</h3>
              <div className="sp-fs">
                <span className="sp-fl">Category</span>
                {["T-Shirts","Hoodies","Jeans","Shoes"].map((c,i) =>
                  <CheckItem key={c} label={c} defaultChecked={i<2} />)}
              </div>
              <div className="sp-fs">
                <span className="sp-fl">Price Range</span>
                <div className="sp-pt">
                  <div className="sp-pf" />
                  <div className="sp-ph" style={{ left: "14%" }} />
                  <div className="sp-ph" style={{ left: "76%" }} />
                </div>
                <div className="sp-pl"><span>$50</span><span>$350</span></div>
              </div>
              <div className="sp-fs">
                <span className="sp-fl">Brand</span>
                {["Nike","Adidas","Puma","Levi's"].map((b,i) =>
                  <CheckItem key={b} label={b} defaultChecked={i>0} />)}
              </div>
              <div className="sp-fbs">
                <button className="sp-abt">Apply Filters</button>
                <button className="sp-rst">Reset</button>
              </div>
            </aside>

            {/* PRODUCTS */}
            <div>
              <div className="sp-ph2">
                <p className="sp-eye">Our Selection</p>
                <h3 className="sp-ptitle">Featured Products</h3>
              </div>

              <div className="sp-tb">
                <span className="sp-cnt">{products.length} items</span>
                <div className="sp-sw">
                  <span className="sp-slbl">Sort</span>
                  <select className="sp-sel">
                    <option>Newest</option>
                    <option>Price: Low to High</option>
                    <option>Price: High to Low</option>
                    <option>Top Rated</option>
                  </select>
                </div>
              </div>

              {!isLoading && errorMessage && <p className="sp-err">{errorMessage}</p>}

              <div className="sp-grid">
                {isLoading
                  ? Array.from({ length: 8 }).map((_,i) => <SkeletonCard key={i} />)
                  : products.map(item => <ProductCard key={item.id} item={item} />)}
              </div>

              {!isLoading && !errorMessage && products.length === 0 && (
                <div className="sp-empty">No products available</div>
              )}

              {/* Pagination */}
              <nav className="sp-pag">
                <button className="sp-pb" disabled><Icons.ChevLeft /></button>
                {[1,2,3].map(n => (
                  <button key={n} className={`sp-pb ${activePage===n?"a":""}`} onClick={() => setActivePage(n)}>{n}</button>
                ))}
                <span className="sp-pdots">···</span>
                <button className="sp-pb" onClick={() => setActivePage(8)}>8</button>
                <button className="sp-pb"><Icons.ChevRight /></button>
              </nav>
            </div>
          </div>
        </main>

        {/* ── FOOTER ── */}
        <footer className="sp-ft">
          <div className="sp-ft-in">
            <div className="sp-ft-g">
              <div>
                <a href="#" className="sp-logo" style={{ textDecoration:"none" }}>
                  <span className="sp-logo-icon"><Icons.Store /></span>
                  <span className="sp-logo-text">Shopify</span>
                </a>
                <p className="sp-ft-desc">Your destination for curated fashion<br />and lifestyle essentials.</p>
              </div>
              {[
                { title:"Shop", links:["New Arrivals","Men","Women","Accessories"] },
                { title:"About", links:["Our Story","Careers","Press"] },
                { title:"Support", links:["Contact Us","FAQ","Shipping & Returns"] },
              ].map(col => (
                <div key={col.title}>
                  <h4 className="sp-ft-h">{col.title}</h4>
                  {col.links.map(l => <a key={l} href="#" className="sp-ft-a">{l}</a>)}
                </div>
              ))}
              <div>
                <h4 className="sp-ft-h">Follow Us</h4>
                <div className="sp-socs">
                  <a href="#" className="sp-soc" aria-label="Twitter"><Icons.Twitter /></a>
                  <a href="#" className="sp-soc" aria-label="Instagram"><Icons.Instagram /></a>
                </div>
              </div>
            </div>
            <div className="sp-ft-bot">
              <p className="sp-copy">© 2024 Shopify · All Rights Reserved</p>
              <nav className="sp-leg">
                <a href="#">Privacy</a><a href="#">Terms</a><a href="#">Cookies</a>
              </nav>
            </div>
          </div>
        </footer>

      </div>
    </>
  );
};

export default MainPage;