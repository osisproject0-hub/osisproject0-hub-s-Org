import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import type { Post, Program, Testimonial, Member } from '../../types';
import { useSiteSettings } from '../../hooks/useSiteSettings';

const SkeletonLoader: React.FC<{ className?: string }> = ({ className }) => (
    <div className={`bg-gray-200 rounded-md animate-pulse ${className}`}></div>
);

const HomePage: React.FC = () => {
    const [posts, setPosts] = useState<Post[]>([]);
    const [programs, setPrograms] = useState<Program[]>([]);
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const [memberOfTheMonth, setMemberOfTheMonth] = useState<Member | null>(null);
    const [loading, setLoading] = useState(true);
    const { settings } = useSiteSettings();
    const [currentSlide, setCurrentSlide] = useState(0);

    const slides = [
        { 
            title: settings['hero_title'] || 'Selamat Datang di Website OSIS',
            subtitle: settings['hero_subtitle'] || 'SMK LPPMRI 2 KEDUNGREJA',
            tagline: settings['hero_tagline'] || 'Mewujudkan Siswa yang Kreatif, Inovatif, dan Berkarakter.',
            bgUrl: settings['hero_bg_url'] || 'https://picsum.photos/seed/school/1600/900',
            link: '/about',
            linkLabel: 'Pelajari Lebih Lanjut'
        },
        { 
            title: 'Berita Terbaru',
            subtitle: 'Jangan lewatkan informasi terbaru dari kegiatan kami.',
            tagline: 'Lihat semua artikel dan pengumuman penting.',
            bgUrl: 'https://picsum.photos/seed/newshero/1600/900',
            link: '/blog',
            linkLabel: 'Lihat Berita'
        },
        { 
            title: 'Program Kerja Unggulan',
            subtitle: 'Temukan berbagai program menarik yang kami siapkan.',
            tagline: 'Dari kegiatan sosial hingga pengembangan bakat.',
            bgUrl: 'https://picsum.photos/seed/programhero/1600/900',
            link: '/programs',
            linkLabel: 'Jelajahi Program'
        }
    ];

    const nextSlide = useCallback(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, [slides.length]);
    
    useEffect(() => {
        const slideInterval = setInterval(nextSlide, 7000);
        return () => clearInterval(slideInterval);
    }, [nextSlide]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            
            const { data: postData } = await supabase.from('posts').select('*').order('created_at', { ascending: false }).limit(3);
            const { data: programData } = await supabase.from('programs').select('*').order('date', { ascending: true }).limit(3);
            const { data: testimonialData } = await supabase.from('testimonials').select('*').eq('is_active', true).order('created_at', { ascending: false });
            const { data: motmData } = await supabase.from('members').select('*').eq('is_member_of_the_month', true).limit(1).single();
            
            if(postData) setPosts(postData);
            if(programData) setPrograms(programData);
            if(testimonialData) setTestimonials(testimonialData);
            if(motmData) setMemberOfTheMonth(motmData);

            setTimeout(() => setLoading(false), 500); // Simulate loading
        };
        fetchData();
    }, []);

    const slide = slides[currentSlide];

    return (
        <div className="overflow-x-hidden">
            {/* Hero Section */}
            <section className="relative h-[60vh] md:h-[80vh] text-white overflow-hidden">
                {slides.map((s, index) => (
                    <div key={index} className={`absolute inset-0 w-full h-full bg-cover bg-center transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100' : 'opacity-0'}`} style={{ backgroundImage: `url('${s.bgUrl}')` }}>
                         <div className="absolute inset-0 bg-black opacity-50"></div>
                    </div>
                ))}
                 <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 flex flex-col items-center justify-center h-full">
                    <div className="max-w-3xl" key={currentSlide}>
                        <h1 className="text-4xl md:text-6xl font-extrabold leading-tight animate-fade-in-down">{slide.title}</h1>
                        <p className="mt-4 text-lg md:text-xl mx-auto animate-fade-in-up delay-200">{slide.subtitle}</p>
                        <p className="mt-2 text-md md:text-lg mx-auto animate-fade-in-up delay-300">{slide.tagline}</p>
                        <Link to={slide.link} className="mt-8 inline-block bg-white text-blue-600 font-bold py-3 px-8 rounded-full hover:bg-gray-200 transition duration-300 transform hover:scale-105 animate-fade-in-up delay-500">
                            {slide.linkLabel}
                        </Link>
                    </div>
                </div>
                 <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex space-x-2">
                    {slides.map((_, index) => (
                        <button key={index} onClick={() => setCurrentSlide(index)} className={`w-3 h-3 rounded-full ${currentSlide === index ? 'bg-white' : 'bg-white/50'}`}></button>
                    ))}
                </div>
            </section>
            
            {/* Member of the Month Section */}
            {(loading || memberOfTheMonth) && (
                 <section className="py-16 bg-blue-50">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <h2 className="text-3xl font-bold text-center mb-10 text-gray-800">Anggota Teladan Bulan Ini</h2>
                        {loading ? (
                             <div className="max-w-3xl mx-auto grid md:grid-cols-3 gap-8 items-center bg-white p-8 rounded-lg shadow-lg">
                                <div className="md:col-span-1 flex justify-center">
                                    <SkeletonLoader className="w-40 h-40 rounded-full" />
                                </div>
                                <div className="md:col-span-2">
                                    <SkeletonLoader className="h-8 w-1/2 mb-2" />
                                    <SkeletonLoader className="h-5 w-1/3 mb-4" />
                                    <SkeletonLoader className="h-4 w-full mb-2" />
                                    <SkeletonLoader className="h-4 w-full mb-2" />
                                    <SkeletonLoader className="h-4 w-3/4" />
                                </div>
                            </div>
                        ) : memberOfTheMonth && (
                            <div className="max-w-3xl mx-auto grid md:grid-cols-3 gap-8 items-center bg-white p-8 rounded-lg shadow-lg">
                                <div className="md:col-span-1 flex flex-col items-center text-center">
                                    <img src={memberOfTheMonth.photo_url || `https://i.pravatar.cc/150?u=${memberOfTheMonth.id}`} alt={memberOfTheMonth.name} className="w-40 h-40 rounded-full object-cover shadow-md" />
                                </div>
                                <div className="md:col-span-2">
                                    <h3 className="text-2xl font-bold text-blue-600">{memberOfTheMonth.name}</h3>
                                    <p className="text-gray-600 font-semibold mb-3">{memberOfTheMonth.position}</p>
                                    <blockquote className="text-gray-700 italic border-l-4 border-blue-200 pl-4">
                                        <p>{memberOfTheMonth.motm_bio || 'Anggota berdedikasi yang selalu menunjukkan inisiatif dan semangat dalam setiap kegiatan.'}</p>
                                    </blockquote>
                                </div>
                            </div>
                        )}
                    </div>
                </section>
            )}


            {/* Latest News */}
            <section className="py-16 bg-white">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold text-center mb-10">Berita Terbaru</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        {loading ? (
                             Array.from({ length: 3 }).map((_, index) => (
                                <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden">
                                    <SkeletonLoader className="h-48 w-full" />
                                    <div className="p-6">
                                        <SkeletonLoader className="h-6 w-full mb-4" />
                                        <SkeletonLoader className="h-4 w-1/3 mb-4" />
                                        <SkeletonLoader className="h-4 w-full mb-2" />
                                        <SkeletonLoader className="h-4 w-full mb-4" />
                                        <SkeletonLoader className="h-5 w-1/2" />
                                    </div>
                                </div>
                            ))
                        ) : (
                            posts.map(post => (
                                <div key={post.id} className="bg-white rounded-lg shadow-lg overflow-hidden transform hover:-translate-y-2 transition-transform duration-300">
                                    <img className="h-48 w-full object-cover" src={post.image_url || 'https://picsum.photos/seed/news/400/250'} alt={post.title} />
                                    <div className="p-6">
                                        <h3 className="font-bold text-xl mb-2">{post.title}</h3>
                                        <p className="text-gray-600 text-sm mb-4">{new Date(post.created_at).toLocaleDateString()}</p>
                                        <p className="text-gray-700 text-base line-clamp-3">{post.content}</p>
                                        <Link to={`/blog/${post.id}`} className="text-blue-500 hover:text-blue-700 font-semibold mt-4 inline-block">Baca Selengkapnya &rarr;</Link>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </section>
            
            {/* Focus Section */}
            <section className="py-16 bg-gray-50">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">{settings['focus_main_title'] || 'Fokus Utama Kami'}</h2>
                    <div className="grid md:grid-cols-3 gap-10 text-center">
                        <div className="p-6">
                            <div className="text-blue-500 mb-4">
                                <i className="fas fa-lightbulb fa-3x"></i>
                            </div>
                            <h3 className="text-xl font-semibold mb-2">{settings['focus_1_title'] || 'Kreativitas & Inovasi'}</h3>
                            <p className="text-gray-600">{settings['focus_1_desc'] || 'Mendorong dan mewadahi ide-ide kreatif serta inovasi dari seluruh siswa.'}</p>
                        </div>
                        <div className="p-6">
                            <div className="text-green-500 mb-4">
                                <i className="fas fa-users fa-3x"></i>
                            </div>
                            <h3 className="text-xl font-semibold mb-2">{settings['focus_2_title'] || 'Kepemimpinan & Organisasi'}</h3>
                            <p className="text-gray-600">{settings['focus_2_desc'] || 'Melatih jiwa kepemimpinan dan kemampuan berorganisasi untuk masa depan.'}</p>
                        </div>
                        <div className="p-6">
                             <div className="text-purple-500 mb-4">
                                <i className="fas fa-heart fa-3x"></i>
                            </div>
                            <h3 className="text-xl font-semibold mb-2">{settings['focus_3_title'] || 'Sosial & Kepedulian'}</h3>
                            <p className="text-gray-600">{settings['focus_3_desc'] || 'Menumbuhkan rasa kepedulian terhadap sesama dan lingkungan sekitar.'}</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Upcoming Programs */}
            <section className="py-16 bg-white">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold text-center mb-10">Program Akan Datang</h2>
                     <div className="space-y-6 max-w-4xl mx-auto">
                        {loading ? (
                            Array.from({ length: 3 }).map((_, index) => (
                                <div key={index} className="bg-white p-6 rounded-lg shadow-md flex items-center space-x-6">
                                    <SkeletonLoader className="w-24 h-24 rounded-md" />
                                    <div className="flex-grow">
                                        <SkeletonLoader className="h-6 w-3/4 mb-3" />
                                        <SkeletonLoader className="h-4 w-full" />
                                    </div>
                                </div>
                            ))
                        ) : (
                            programs.map(program => (
                                <div key={program.id} className="bg-gray-50 p-6 rounded-lg shadow-md flex items-center space-x-6 hover:shadow-xl transition-shadow duration-300">
                                    <div className="flex-shrink-0 bg-blue-500 text-white rounded-md p-4 text-center w-24">
                                        <span className="block text-2xl font-bold">{new Date(program.date).getDate()}</span>
                                        <span className="block text-sm uppercase tracking-wider">{new Date(program.date).toLocaleString('id-ID', { month: 'short' })}</span>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-semibold text-gray-800">{program.title}</h3>
                                        <p className="text-gray-600 mt-1">{program.description}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </section>

            {/* Call to Action Section */}
             <section className="py-20 bg-gray-50">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold text-center mb-10 text-gray-800">{settings['cta_main_title'] || 'Ayo Terlibat!'}</h2>
                    <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
                        <Link to="/gallery" className="block group">
                            <div className="bg-cover bg-center rounded-lg shadow-lg p-8 h-56 flex flex-col justify-end text-white relative overflow-hidden" style={{ backgroundImage: `url('${settings['cta_gallery_bg_url'] || 'https://picsum.photos/seed/gallerycta/600/400'}')` }}>
                                 <div className="absolute inset-0 bg-black opacity-40 group-hover:opacity-60 transition-opacity duration-300"></div>
                                <h3 className="text-2xl font-bold z-10 relative">{settings['cta_gallery_title'] || 'Lihat Galeri Kami'}</h3>
                                <p className="z-10 relative">{settings['cta_gallery_desc'] || 'Momen tak terlupakan dari kegiatan kami.'}</p>
                            </div>
                        </Link>
                         <Link to="/contact" className="block group">
                            <div className="bg-cover bg-center rounded-lg shadow-lg p-8 h-56 flex flex-col justify-end text-white relative overflow-hidden" style={{ backgroundImage: `url('${settings['cta_contact_bg_url'] || 'https://picsum.photos/seed/contactcta/600/400'}')` }}>
                                 <div className="absolute inset-0 bg-black opacity-40 group-hover:opacity-60 transition-opacity duration-300"></div>
                                <h3 className="text-2xl font-bold z-10 relative">{settings['cta_contact_title'] || 'Hubungi Kami'}</h3>
                                <p className="z-10 relative">{settings['cta_contact_desc'] || 'Punya pertanyaan atau saran? Kami siap mendengar.'}</p>
                            </div>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            {testimonials.length > 0 && (
                <section className="py-16 bg-blue-600 text-white">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <h2 className="text-3xl font-bold text-center mb-10">{settings['testimonial_section_title'] || 'Kata Mereka'}</h2>
                        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                            {testimonials.map(testimonial => (
                                <div key={testimonial.id} className="bg-white/20 p-6 rounded-lg">
                                    <p className="italic">"{testimonial.quote}"</p>
                                    <p className="mt-4 font-semibold">- {testimonial.author}, {testimonial.role}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
};

export default HomePage;