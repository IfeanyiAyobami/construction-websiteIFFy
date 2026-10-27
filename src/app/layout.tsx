import type { Metadata } from 'next';

import './globals.css';
import ScrollToTop from '../components/ScrollToTop';
import ButtonFeedback from '../components/ButtonFeedback';


export const metadata: Metadata = { title:'KONSADEM | Engineering the Future', description:'KONSADEM Associates Ltd — engineering, construction and consultancy.' };
export default function RootLayout({children}:{children:React.ReactNode}) {return <html lang="en"><body >{children}<ButtonFeedback/><ScrollToTop/></body></html>}
