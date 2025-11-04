import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import type { Post, Program, Testimonial } from '../../types';
import Spinner from '../../components/Spinner';
import { useSiteSettings } from '../../hooks/useSiteSettings';

const HomePage: React.FC = () => {
    const [posts, setPosts] = useState<Post[]>([]);
    const [featuredPost, setFeaturedPost] = useState<Post | null>(null);
    const [programs, setPrograms] = useState<Program[]>([]);
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const [loading, setLoading] = useState(true);
    const { settings } = useSiteSettings();

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            
            const { data: postData, error: postError } = await supabase
                .from('posts')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(4);

            const { data: programData, error: programError } = await supabase
                .from('programs')
                .select('*')
                .order('date', { ascending: true })
                .limit(3);

            const { data: testimonialData, error: testimonialError } = await supabase
                .from('testimonials')
                .select('*')
                .eq('is_active', true)
                .order('created_at', { ascending: false });
            
            if(postData && postData.length > 0) {
                setFeaturedPost(postData[0]);
                setPosts(postData.slice(1, 4));
            }
            if(programData) setPrograms(programData);
            if(testimonialData) setTestimonials(testimonialData);

            if(postError) console.error("Error fetching posts:", postError.message);
            if(programError) console.error("Error fetching programs:", programError.message);
            if(testimonialError) console.error("Error fetching testimonials:", testimonialError.message);
            
            setLoading(false);
        };
        fetchData();
    }, []);

    return (
        <div className="overflow-x-hidden">
            {/* Hero Section */}
            <section className="relative bg-blue-600 text-white py-20 md:py-32 bg-cover bg-center" style={{ backgroundImage: `url('${settings['hero_bg_url'] || 'https://picsum.photos/seed/school/1600/900'}')` }}>
                 <div className="absolute inset-0 bg-black opacity-50"></div>
                 <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                    <h1 className="text-4xl md:text-6xl font-extrabold leading-tight animate-fade-in-down">{settings['hero_title'] || 'Selamat Datang di Website OSIS'}</h1>
                    <p className="mt-4 text-lg md:text-xl max-w-3xl mx-auto animate-fade-in-up delay-200">{settings['hero_subtitle'] || 'SMK LPPMRI 2 KEDUNGREJA'}</p>
                    <p className="mt-2 text-md md:text-lg max-w-3xl mx-auto animate-fade-in-up delay-300">{settings['hero_tagline'] || 'Mewujudkan Siswa yang Kreatif, Inovatif, dan Berkarakter.'}</p>
                    <Link to="/about" className="mt-8 inline-block bg-white text-blue-600 font-bold py-3 px-8 rounded-full hover:bg-gray-200 transition duration-300 transform hover:scale-105 animate-fade-in-up delay-500">
                        Pelajari Lebih Lanjut
                    </Link>
                </div>
            </section>

            {/* Featured Post Section */}
            {loading ? <div className="py-16"><Spinner/></div> : featuredPost && (
                <section className="py-16 bg-white">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <h2 className="text-3xl font-bold text-center mb-10 text-gray-800">Berita Utama</h2>
                        <div className="grid md:grid-cols-2 gap-8 items-center bg-gray-50 p-8 rounded-lg shadow-lg">
                            <div className="order-2 md:order-1">
                                <span className="text-blue-500 font-semibold text-sm">{featuredPost.category || 'Terbaru'}</span>
                                <h3 className="text-2xl md:text-3xl font-bold mt-2 mb-4 text-gray-900">{featuredPost.title}</h3>
                                <p className="text-gray-600 mb-6 line-clamp-4">{featuredPost.content}</p>
                                <Link to={`/blog/${featuredPost.id}`} className="font-bold text-white bg-blue-600 py-3 px-6 rounded-lg hover:bg-blue-700 transition duration-300">
                                    Baca Selengkapnya
                                </Link>
                            </div>
                            <div className="order-1 md:order-2">
                                <img src={featuredPost.image_url || 'https://picsum.photos/seed/featured/600/400'} alt={featuredPost.title} className="rounded-lg shadow-md w-full h-auto object-cover max-h-80" />
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* Latest News */}
            <section className="py-16 bg-gray-50">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold text-center mb-10">Berita Lainnya</h2>
                    {loading ? <Spinner /> : (
                        <div className="grid md:grid-cols-3 gap-8">
                            {posts.map(post => (
                                <div key={post.id} className="bg-white rounded-lg shadow-lg overflow-hidden transform hover:-translate-y-2 transition-transform duration-300">
                                    <img className="h-48 w-full object-cover" src={post.image_url || 'https://picsum.photos/seed/news/400/250'} alt={post.title} />
                                    <div className="p-6">
                                        <h3 className="font-bold text-xl mb-2">{post.title}</h3>
                                        <p className="text-gray-600 text-sm mb-4">{new Date(post.created_at).toLocaleDateString()}</p>
                                        <p className="text-gray-700 text-base line-clamp-3">{post.content}</p>
                                        <Link to={`/blog/${post.id}`} className="text-blue-500 hover:text-blue-700 font-semibold mt-4 inline-block">Baca Selengkapnya &rarr;</Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>
            
            {/* Focus Section */}
            <section className="py-16 bg-white">
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
            <section className="py-16 bg-gray-50">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold text-center mb-10">Program Akan Datang</h2>
                    {loading ? <Spinner /> : (
                         <div className="space-y-6 max-w-4xl mx-auto">
                            {programs.map(program => (
                                <div key={program.id} className="bg-white p-6 rounded-lg shadow-md flex items-center space-x-6 hover:shadow-xl transition-shadow duration-300">
                                    <div className="flex-shrink-0 bg-blue-500 text-white rounded-md p-4 text-center w-24">
                                        <span className="block text-2xl font-bold">{new Date(program.date).getDate()}</span>
                                        <span className="block text-sm uppercase tracking-wider">{new Date(program.date).toLocaleString('id-ID', { month: 'short' })}</span>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-semibold text-gray-800">{program.title}</h3>
                                        <p className="text-gray-600 mt-1">{program.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Call to Action Section */}
             <section className="py-20 bg-white">
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