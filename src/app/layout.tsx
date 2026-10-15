import type { Metadata } from 'next';
import { Manrope, Space_Grotesk } from 'next/font/google';
import './globals.css';
import ScrollToTop from '../components/ScrollToTop';
const manrope = Manrope({ subsets:['latin'], variable:'--font-body', display:'swap' });
const space = Space_Grotesk({ subsets:['latin'], variable:'--font-display', display:'swap' });
export const metadata: Metadata = { title:'MONUMENT | Engineering the Future', description:'Concept website for a civil engineering and construction firm in Nigeria. Demonstration content only.' };
export default function RootLayout({children}:{children:React.ReactNode}) {return <html lang="en"><body className={`${manrope.variable} ${space.variable}`}>{children}<ScrollToTop/></body></html>}
