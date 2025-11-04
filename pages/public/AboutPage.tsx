import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import type { Member, Division } from '../../types';
import { useSiteSettings } from '../../hooks/useSiteSettings';

interface DivisionWithMembers extends Division {
    members: Member[];
}

const SkeletonLoader: React.FC<{ className?: string }> = ({ className }) => (
    <div className={`bg-gray-200 rounded-md animate-pulse ${className}`}></div>
);

const AboutPage: React.FC = () => {
  const [divisions, setDivisions] = useState<DivisionWithMembers[]>([]);
  const [loading, setLoading] = useState(true);
  const { settings } = useSiteSettings();

  useEffect(() => {
    const fetchStructure = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('divisions')
        .select('*, members(*)')
        .order('display_order', { ascending: true });
      
      if (error) {
        console.error("Error fetching organizational structure: ", error.message);
      } else if (data) {
        const positionOrder: { [key: string]: number } = {
            'ketua': 1, 'wakil': 2, 'sekretaris': 3, 'bendahara': 4,
            'koordinator': 5, 'anggota': 6
        };

        const getPositionSortKey = (position: string): number => {
            const lowerPos = position.toLowerCase();
            for (const key in positionOrder) {
                if (lowerPos.includes(key)) return positionOrder[key];
            }
            return 99;
        };

        const sortedData = data.map(division => ({
            ...division,
            members: division.members.sort((a, b) => getPositionSortKey(a.position) - getPositionSortKey(b.position))
        }));

        setDivisions(sortedData as DivisionWithMembers[]);
      }
      setLoading(false);
    }
    fetchStructure();
  }, []);
  
  // Safely parse missions, assuming it's a JSON string array
  let missions: string[] = [
    'Meningkatkan kualitas kegiatan ekstrakurikuler.',
    'Mengadakan acara yang edukatif dan menghibur.',
    'Menjalin hubungan baik antara siswa, guru, dan staf.',
    'Mendorong partisipasi aktif siswa dalam kegiatan sekolah.',
    'Menumbuhkan semangat kebersamaan dan solidaritas.'
  ];
  try {
    const parsed = JSON.parse(settings['about_missions'] || '[]');
    if (Array.isArray(parsed) && parsed.every(item => typeof item === 'string')) {
      missions = parsed;
    }
  } catch (e) {
    // Silently fail and use default missions
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
            {loading ? (
                 <div className="space-y-12">
                    {Array.from({ length: 3 }).map((_, groupIndex) => (
                        <div key={groupIndex}>
                            <SkeletonLoader className="h-8 w-1/2 mx-auto mb-6" />
                            <SkeletonLoader className="h-4 w-2/3 mx-auto mb-8" />
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
                                {Array.from({ length: 4 }).map((_, memberIndex) => (
                                    <div key={memberIndex} className="text-center">
                                        <SkeletonLoader className="w-28 h-28 mx-auto rounded-full shadow-lg" />
                                        <SkeletonLoader className="mt-4 h-6 w-3/4 mx-auto" />
                                        <SkeletonLoader className="mt-2 h-4 w-1/2 mx-auto" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
              <div className="space-y-16">
                {divisions.map((division) => (
                  <div key={division.id}>
                    <h3 className="text-2xl font-bold text-gray-800 mb-2 text-center capitalize pb-2 border-b-2 border-blue-200 inline-block">
                      {division.name}
                    </h3>
                    {division.description && <p className="text-gray-500 mt-2 mb-8 max-w-xl mx-auto">{division.description}</p>}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10 mt-4">
                      {division.members.map((member) => (
                        <div key={member.id} className="text-center group">
                          <img 
                            className="w-28 h-28 mx-auto rounded-full shadow-lg object-cover transform group-hover:scale-110 transition-transform duration-300" 
                            src={member.photo_url || `https://i.pravatar.cc/150?u=${member.id}`} 
                            alt={member.name} 
                          />
                          <h4 className="mt-4 text-lg font-semibold text-gray-800">{member.name}</h4>
                          <p className="text-sm text-blue-500 font-medium">{member.position}</p>
                        </div>
                      ))}
                    </div>
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