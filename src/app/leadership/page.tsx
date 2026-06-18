'use client';

import Image from 'next/image';
import HeroSection from '@/components/HeroSection';
import { useState } from 'react';

interface TeamMember {
  name: string;
  role: string;
  bio: string[];
  image?: string;
  imagePosition?: string;
  imageScale?: number;
}

const leadership: { [key: string]: TeamMember[] } = {
  Pastors: [
    {
      name: 'Jeremy Howard',
      role: 'Staff Pastor',
      bio: [
        'Jeremy Howard is our staff pastor. He and his wife, Melissa, are both from Missouri. They married in 2010 and moved to Kansas City, MO where Jeremy graduated from Calvary Bible College in 2013 with a Bachelor of Science degree in Advanced Biblical Studies. They moved to Utah in May 2014 to be used by God at Orchard Hills Bible Church.',
        'Jeremy loves music, writing, theology, and baseball. He and Melissa have three children. You can read articles by Jeremy on his website, jeremyhoward.net, and you can listen to his podcast at dotheology.com.'
      ],
      image: '/images/site_img/leadership/jeremy-howard.jpg',
      imagePosition: 'center 30%',
      imageScale: 0.8
    },
    {
      name: 'Tyler Woodhead',
      role: 'Pastor',
      bio: [
        'Tyler Woodhead is a Utah native who has grown up well-acquainted with Mormonism and its ability to either draw or repel those who encounter it. His wife, Britny, was delivered out of Mormonism, and together the two went to Frontier Bible College in LaGrange, Wyoming where Tyler earned his Bachelor of Arts degree in Biblical Studies, with an emphasis in Pastoral Ministry.',
        'After graduating in 2012, they moved back to Ogden, Utah as church planters until the Lord directed them to Payson, Utah in 2018, where they now serve at Orchard Hills Bible Church along with their three boys.'
      ],
      image: '/images/site_img/leadership/tyler-woodhead.jpg',
      imagePosition: 'center 25%',
      imageScale: 0.8
    },
    {
      name: 'Dean Stucker',
      role: 'Pastor',
      bio: [
        'Dean Stucker was raised in Albuquerque, New Mexico. He moved to Utah in 2013 for work as the Sales Manger for Pepsi of Springville. He and Jen married in 2015 and have three great children.',
        'He enjoys camping and outdoor activities with family and friends. He has a passion for teaching and leading, especially with the younger generation. He loves being a kids\' class teacher, especially when he has the opportunity to team-teach with his wife. He desires to lead the children\'s ministry someday and oversee their direction and vision of growth as disciples of Christ preparing themselves for the Great Commission.'
      ],
      image: '/images/site_img/leadership/dean-stucker.jpg',
      imagePosition: 'center 25%',
      imageScale: 0.8
    }
  ],
  Deacons: [
    {
      name: 'Jim Carpenter',
      role: 'Deacon',
      bio: [
        'Jim Carpenter grew up in Fort Worth, Texas. After moving to Colorado, he met and married Sandra, and they lived there for 39 years. They moved to Utah to be closer to their children and grandchildren. They have two daughters, six grandchildren and eight great-grandchildren.',
        'Since retiring he has enjoyed fishing, hunting, camping, mechanical work, building, and welding. He desires to love the Lord his God with all his heart, soul, and mind.'
      ],
      image: '/images/site_img/leadership/jim-carpenter.jpg',
      imagePosition: 'center 25%',
      imageScale: 0.8
    },
    {
      name: 'Rex Dana',
      role: 'Deacon',
      bio: [
        'Rex Dana was born in Odgen, Utah. He was raised throughout Utah, Nevada, and California. He served 6 years in the US Army, three of which were in Italy and Germany. He served five years in the U.S. Air Force National Guard in Salt Lake City. While stationed there, he married Ellie on April 19, 1975. He retired in 2014 after serving 40 years in law enforcement in Utah. He and Ellie have four sons, fifteen grandchildren and three great-grandchildren.',
        'In 2006, Rex surrendered his life and soul to the Lord Jesus Christ under the leadership of Pastor Lee Whitworth here, at what was then called Payson Bible Church. He had the privilege and honor to baptize his beautiful wife Ellie after she received Jesus into her life in 2008. They have served their King together since that time and plan to continue serving until the Lord takes them to be with Him in eternity.'
      ],
      image: '/images/site_img/leadership/rex-dana.jpg',
      imagePosition: 'center 20%',
      imageScale: 0.8
    },
    {
      name: 'Logan Mast',
      role: 'Deacon',
      bio: [
        'Logan Mast grew up on the plains of Montana. He was raised a Mennonite and spent three years on a mission in Costa Rica. He is married to his beautiful wife Dory and they have four boys. They moved to Utah in the fall of 2019 and year later he and his family started attending Orchard Hills Bible Church.',
        'Logan works in construction. His hobbies are hunting, fishing and trying to pass on the wonder of God\'s great outdoors to his boys. He desires to serve God to the best of his ability in our valley and through this church body.'
      ],
      image: '/images/site_img/leadership/logan-mast.jpg',
      imagePosition: 'center 20%',
      imageScale: 0.8
    },
    {
      name: 'Hayden Messick',
      role: 'Deacon',
      bio: [
        'Hayden Messick is a native to Utah, growing up in Springville and then moving to Santaquin. He married his loving wife Anna in 2023 and was blessed with a daughter in 2025. He works for Provo City as an Instrumentation and Controls technician, performing maintenance at Provo\'s Water Reclamation Plant.',
        'Hayden grew up in Mormonism and didn\'t know the Gospel until his father in-law told him about God\'s grace in 2020. He later put his faith and trust in Jesus, devoting his life to following and serving Christ. He enjoys spending time with his wife, as they raise their daughter together. He also has great love for being with his brothers and sisters at Orchard Hills Bible Church.'
      ],
      image: '/images/site_img/leadership/hayden-messick.jpg',
      imagePosition: 'center 25%',
      imageScale: 0.8
    },
    {
      name: 'Bryan Wadlington',
      role: 'Deacon',
      bio: [
        'Bio coming soon.'
      ]
    }
  ],
  'Office Administrator': [
    {
      name: 'Sandra Carpenter',
      role: 'Office Administrator',
      bio: [
        'Sandra Carpenter was born and raised in Colorado. At the age of 17, she realized it was not within her ability to be what God desired. She gladly admitted she fell short and received the mercy and grace God provides for those whose hearts are changed by Him. She married Jim in 1981 and, in 2020, they decided to move to Utah to be closer to family. Finding a new church family came easy at Orchard Hills Bible Church. She has always felt that serving God is a must and a joy to reflect the changes He has worked in her life.'
      ],
      image: '/images/site_img/leadership/sandra-carpenter.jpg',
      imagePosition: 'center 30%',
      imageScale: 0.8
    }
  ]
};

// Helper function to sort leadership members by last name
const sortLeadership = (leadership: { [key: string]: TeamMember[] }) => {
  const sorted: { [key: string]: TeamMember[] } = {};

  for (const [key, members] of Object.entries(leadership)) {
    if (key === 'Pastors') {
      sorted[key] = [...members];
    } else {
      sorted[key] = [...members].sort((a, b) => {
        const aLastName = a.name.split(' ').pop() || '';
        const bLastName = b.name.split(' ').pop() || '';
        return aLastName.localeCompare(bLastName);
      });
    }
  }

  return sorted;
};

export default function Leadership() {
  const [selectedCategory, setSelectedCategory] = useState<string>('pastors');
  
  const categories = [
    { id: 'pastors', label: 'Pastors' },
    { id: 'deacons', label: 'Deacons' },
    { id: 'administrative', label: 'Administrative Staff' }
  ];

  const getFilteredLeadership = () => {
    const filtered: { [key: string]: TeamMember[] } = {};
    
    if (selectedCategory === 'pastors') {
      filtered.Pastors = leadership.Pastors || [];
    } else if (selectedCategory === 'deacons') {
      filtered.Deacons = leadership.Deacons || [];
    } else if (selectedCategory === 'administrative') {
      // Combine all other categories under Administrative Staff
      Object.keys(leadership).forEach(key => {
        if (key !== 'Pastors' && key !== 'Deacons') {
          filtered[key] = leadership[key];
        }
      });
    }
    
    return sortLeadership(filtered);
  };

  const sortedLeadership = getFilteredLeadership();
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-200">
      <HeroSection 
        title="Church Leadership"
        subtitle="Meet our dedicated ministry team serving at Orchard Hills Bible Church"
        className="bg-gradient-to-r from-blue-700 to-blue-900 dark:from-gray-800 dark:to-gray-900 text-white py-3 sm:py-4"
      >
        <div className="mt-6">
          {/* Category Toggle Buttons */}
          <div className="flex flex-wrap justify-center gap-2 mb-4">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  selectedCategory === category.id
                    ? 'bg-white text-blue-700 dark:bg-gray-700 dark:text-white shadow-md transform scale-105 ring-2 ring-white ring-opacity-60'
                    : 'bg-blue-600 text-white hover:bg-blue-500 dark:bg-gray-600 dark:hover:bg-gray-500'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>
      </HeroSection>

      {/* Leadership Sections */}
      <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {Object.entries(sortedLeadership).map(([title, members]) => (
          <div key={title} className="mb-16">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-6 sm:mb-8 pb-2 border-b border-gray-200 dark:border-gray-700">
              {title}
            </h2>
            <div className="space-y-10">
              {members.map((member, index) => (
                <div 
                  key={member.name} 
                  className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden transition-colors duration-200 ${
                    index !== members.length - 1 ? 'mb-10' : ''
                  }`}
                >
                  <div className="md:flex">
                    <div className="md:flex-shrink-0 relative w-full aspect-square max-w-[300px] mx-auto md:mx-0 md:w-48 md:max-w-[192px] lg:w-56 lg:max-w-[224px] overflow-hidden rounded-2xl">
                      {member.image ? (
                        <Image
                          src={member.image}
                          alt={member.name}
                          fill
                          className="object-cover md:object-cover"
                          style={{
                            objectPosition: member.imagePosition || 'center 25%',
                            transform: `scale(${member.imageScale || 0.7})`,
                            width: '100%',
                            height: '100%',
                          }}
                          sizes="(max-width: 768px) 100vw, 224px"
                          priority={index < 3}
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                          <span className="text-4xl font-bold text-gray-400 dark:text-gray-500">
                            {member.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="p-4 sm:p-6 sm:pt-4 md:pt-6">
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
                        {member.name}
                        <span className="block text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">
                          {member.role}
                        </span>
                      </h3>
                      {member.bio.map((paragraph, pIndex) => (
                        <p key={pIndex} className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-3 sm:mb-4 last:mb-0 leading-relaxed sm:leading-normal">
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
