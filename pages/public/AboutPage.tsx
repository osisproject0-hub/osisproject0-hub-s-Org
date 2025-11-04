import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import type { Member } from '../../types';
import Spinner from '../../components/Spinner';
import { useSiteSettings } from '../../hooks/useSiteSettings';

const AboutPage: React.FC = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const { settings } = useSiteSettings();

  useEffect(() => {
    const fetchMembers = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .order('created_at', { ascending: true });
      
      if (data) setMembers(data);
      if (error) console.error("Error fetching members: ", error.message);
      setLoading(false);
    }
    fetchMembers();
  }, []);
  
  // Safely parse missions, assuming it's a JSON string array
  let missions: string[] = [];
  try {
    missions = JSON.parse(settings['about_missions'] || '[]');
  } catch (e) {
    missions = [
      'Meningkatkan kualitas kegiatan ekstrakurikuler.',
      'Mengadakan acara yang edukatif dan menghibur.',
      'Menjalin hubungan baik antara siswa, guru, dan staf.',
      'Mendorong partisipasi aktif siswa dalam kegiatan sekolah.',
      'Menumbuhkan semangat kebersamaan dan solidaritas.'
    ];
  }

  return (
    <div className="bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900">{settings['about_title'] || 'Tentang OSIS SMK LPPMRI 2 Kedungreja'}</h1>
          <p className="mt-4 text-lg text-gray-600">{settings['about_subtitle'] || 'Mengenal lebih dekat organisasi kami.'}</p>
        </div>

        <div className="max-w-5xl mx-auto">
          {/* Visi & Misi Section */}
          <div className="mb-16">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-blue-50 p-8 rounded-lg shadow-sm">
                <h2 className="text-2xl font-bold text-blue-800 mb-4 flex items-center"><i className="fas fa-eye mr-3"></i>Visi</h2>
                <p className="text-gray-700">
                  {settings['about_vision'] || 'Menjadikan OSIS sebagai wadah bagi siswa untuk mengembangkan potensi, kreativitas, dan kepemimpinan, serta menciptakan lingkungan sekolah yang positif, inspiratif, dan berprestasi.'}
                </p>
              </div>
              <div className="bg-green-50 p-8 rounded-lg shadow-sm">
                <h2 className="text-2xl font-bold text-green-800 mb-4 flex items-center"><i className="fas fa-rocket mr-3"></i>Misi</h2>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  {missions.map((mission, index) => (
                    <li key={index}>{mission}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          
           {/* History Section */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">{settings['about_history_title'] || 'Sejarah Singkat OSIS'}</h2>
             <div className="bg-gray-50 p-8 rounded-lg shadow-sm text-center">
               <p className="text-gray-700 leading-relaxed max-w-3xl mx-auto">
                  {settings['about_history_content'] || 'Organisasi Siswa Intra Sekolah (OSIS) di SMK LPPMRI 2 Kedungreja telah menjadi pilar utama dalam pengembangan kegiatan kesiswaan sejak awal berdirinya. Dari masa ke masa, OSIS terus berevolusi, beradaptasi dengan tantangan zaman, dan melahirkan program-program inovatif yang tidak hanya berfokus pada hiburan, tetapi juga pada pendidikan karakter, pengembangan soft skill, dan kepedulian sosial. Setiap periode kepengurusan meninggalkan jejaknya sendiri, membangun fondasi yang lebih kuat untuk generasi penerus.'}
               </p>
             </div>
          </div>


          {/* Struktur Organisasi Section */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Struktur Organisasi</h2>
            <p className="text-gray-600 mb-12 max-w-2xl mx-auto">
              Berikut adalah jajaran pengurus OSIS periode saat ini yang siap melayani dan memajukan sekolah.
            </p>
            {loading ? <Spinner /> : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
                {members.map((member) => (
                  <div key={member.id} className="text-center group">
                    <img 
                      className="w-28 h-28 mx-auto rounded-full shadow-lg object-cover transform group-hover:scale-110 transition-transform duration-300" 
                      src={member.photo_url || `https://i.pravatar.cc/150?u=${member.id}`} 
                      alt={member.name} 
                    />
                    <h3 className="mt-4 text-lg font-semibold text-gray-800">{member.name}</h3>
                    <p className="text-sm text-blue-500 font-medium">{member.position}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;