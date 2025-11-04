import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);

    const toggleVisibility = () => {
        if (window.pageYOffset > 300) {
            setIsVisible(true);
        } else {
            setIsVisible(false);
        }
    };

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    useEffect(() => {
        window.addEventListener('scroll', toggleVisibility);
        return () => {
            window.removeEventListener('scroll', toggleVisibility);
        };
    }, []);

  return (
    <>
    <footer className="bg-gray-800 text-white">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-lg font-semibold">OSIS SMK LPPMRI 2 KEDUNGREJA</h3>
            <p className="mt-2 text-gray-400">
              Organisasi Siswa Intra Sekolah yang berdedikasi untuk memajukan kegiatan siswa dan sekolah.
            </p>
            <p className="mt-4 text-gray-400">Jl. Raya Tambaksari, Kedungreja, Cilacap, Jawa Tengah 53263</p>
          </div>
          <div>
            <h3 className="text-sm font-semibold tracking-wider uppercase">Tautan Cepat</h3>
            <ul className="mt-4 space-y-2">
              <li><Link to="/about" className="text-base text-gray-300 hover:text-white">Tentang</Link></li>
              <li><Link to="/programs" className="text-base text-gray-300 hover:text-white">Program</Link></li>
              <li><Link to="/blog" className="text-base text-gray-300 hover:text-white">Berita</Link></li>
              <li><Link to="/gallery" className="text-base text-gray-300 hover:text-white">Galeri</Link></li>
              <li><Link to="/contact" className="text-base text-gray-300 hover:text-white">Kontak</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold tracking-wider uppercase">Sosial Media</h3>
             <div className="flex mt-4 space-x-6">
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                    <span className="sr-only">Instagram</span>
                    <i className="fab fa-instagram fa-lg"></i>
                </a>
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                    <span className="sr-only">Facebook</span>
                    <i className="fab fa-facebook fa-lg"></i>
                </a>
                <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                    <span className="sr-only">YouTube</span>
                    <i className="fab fa-youtube fa-lg"></i>
                </a>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-700 pt-8 text-center">
          <p className="text-base text-gray-400">&copy; {new Date().getFullYear()} OSIS SMK LPPMRI 2 KEDUNGREJA. All rights reserved.</p>
        </div>
      </div>
    </footer>
    {isVisible && (
            <button 
                onClick={scrollToTop} 
                className="fixed bottom-5 right-5 p-3 rounded-full bg-blue-500 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-opacity duration-300 shadow-lg"
                aria-label="Kembali ke atas"
            >
                <i className="fas fa-arrow-up"></i>
            </button>
        )}
    </>
  );
};

export default Footer;