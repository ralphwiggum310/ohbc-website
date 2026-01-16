'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface Missionary {
  name: string;
  organization?: string | React.ReactNode;
  description: (string | React.ReactNode)[];
  location?: string;
  website?: string;
  email?: string;
}

const missionaries: Missionary[] = [
  {
    name: 'Charis Pregnancy Clinic',
    location: 'Salt Lake City & American Fork, UT',
    description: [
      <span key="prc-desc-1">
        For many years, the <a href="https://www.charisclinic.org/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Charis Pregnancy Clinic</a> of Salt Lake City (now also in American Fork) has provided limited obstetrical ultrasounds, pregnancy tests, peer counseling, prenatal nutrition, parenting classes, fatherhood mentoring, post-abortion support, medical and other referrals, material resources such as diapers, formula, car seats, strollers, maternity, and baby clothes, etc. all free of charge to women facing an unexpected pregnancy.
      </span>,
      'Help like this is critical when up to 45 percent of pregnancies are considered "unintended." The clinic serves many clients each year, making thousands of referrals for medical care, WIC, shelter, food, education, rehabilitation, and more. The clinic offers clients hope and love and the Good News of Jesus Christ.'
    ],
    website: 'https://www.charisclinic.org/'
  },
  {
    name: 'Key Radio',
    location: 'Provo, Richfield, Price, and Vernal, UT',
    description: [
      <span key="keyradio-desc-1">
        Key Radio is a non-profit Christian radio network, owned by <a href="https://biblicalministries.org/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Biblical Ministries Worldwide</a>, licensed in Provo with three other stations: Richfield, Price, and Vernal, Utah. Key Radio is a Bible-based, Christ-centered, family-friendly network with national and local programs they are dependent on God's provision through donations from churches and individuals.
      </span>,
      'The staff is not paid and has their own ministry support. The mission of Key Radio is to reach Utah with the life-saving truth of God\'s Word and to complement local evangelical church ministries.'
    ],
    website: 'https://www.keyradio.org/'
  },
  {
    name: 'Lee Whitworth',
    organization: <a href="https://biblicalministries.org/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Biblical Ministries Worldwide</a>,
    location: 'Utah',
    description: [
      <span key="whitworth-desc-1">
        Lee Whitworth and his family have served with <a href="https://biblicalministries.org/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Biblical Ministries Worldwide</a> as church planters in Utah for 34 years. He grew up in Utah and was led to the Lord by a BMW missionary. He was missionary pastor of Payson Bible Church/OHBC between 1990 and 2017 and has served as field leader.
      </span>,
      <span key="whitworth-desc-2">
        Since the loss of his beloved wife and partner, he continues to actively serve in Utah; teaching and preaching in the Provo Bible Church, and other church plants, at Bible Camp and at Key Radio. He is also training men how to teach and preach, doing a variety of building projects for the church, and is actively writing.
      </span>
    ]
  },
  {
    name: 'Frank and Roberta Curtis',
    organization: <a href="https://biblicalministries.org/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Biblical Ministries Worldwide</a>,
    location: 'Utah',
    description: [
      <span key="curtis-desc-1">
        Frank and Roberta Curtis were born in Utah and raised as members of the Church of Jesus Christ of Latter-day Saints. Through the ministry of Payson Bible church/OHBC they came to trust Christ as Savior.
      </span>,
      <span key="curtis-desc-2">
        They serve with <a href="https://biblicalministries.org/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Biblical Ministries Worldwide</a> and planted Provo Bible Church. Frank is gifted and passionate about teaching God's Word and currently serves as the pastor of discipleship at <a href="https://cornerstoneofutah.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Cornerstone Bible Church</a> plant, West Point, Utah.
      </span>
    ]
  },
  {
    name: 'Corrie and Bethamy Anderson',
    organization: <a href="https://www.uim.org/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">UIM International</a>,
    location: 'Guadalajara, Mexico',
    description: [
      <span key="anderson-desc-1">
        Corrie and Bethamy Anderson are a sister team serving with <a href="https://www.uim.org/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">UIM International</a>. From a young age, their parents included them in their church and church-planting ministries. They both attended Calvary University and Calvary Theological Seminary in Kansas City, Missouri.
      </span>,
      <span key="anderson-desc-2">
        They desired to serve the Lord in cross-cultural missions and had the opportunity to learn and minister in their sending church's Hispanic ministry for about 5 years before going to Guadalajara, Mexico to serve in church-planting ministries over the last 13 years. They have been privileged to serve in several locations in Mexico, returning to a suburb of Guadalajara (Valle de los Molinos) in December of 2021.
      </span>,
      <span key="anderson-desc-3">
        Their passion is to share the Gospel and to disciple and train believers in a church-planting context. With this focus, their current ministry activities include personal evangelism, counseling, offering English and piano classes, leading Bible studies, and holding a neighborhood children's Bible club outreach.
      </span>
    ]
  },
  {
    name: 'Fernando and Isabel Bassler',
    organization: <a href="https://allnations.us/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">All Nations Family Inc.</a>,
    location: 'Ecuador',
    description: [
      <span key="bassler-desc-1">
        In 2015 the Bassler's, after much prayer, made the decision to become full-time missionaries with <a href="https://allnations.us/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">All Nations Family Inc.</a> They have a daughter and as a family want to serve and follow the Lord's leading.
      </span>,
      <span key="bassler-desc-2">
        They are excited about sharing the love of Jesus in Ecuador, a country of 19 million with less than 5% having a personal relationship with Jesus Christ. The goal is to reach the second and third generation who show a hunger for truth, love, and hope.
      </span>,
      <span key="bassler-desc-3">
        Their vision is to work within the inner-city planting churches after having planted 8 churches in rural areas. Also, they desire to teach and train locals with the Word of God and teach English as a second language and are looking forward to a possible prison ministry.
      </span>
    ]
  },
  {
    name: 'Allan and Maggie Tayebwa',
    organization: 'Partners In Evangelism International',
    location: 'Uganda',
    description: [
      <span key="tayebwa-desc-1">
        Hope for Uganda is above all else, a church planting ministry. Allan has a burden for establishing Bible teaching churches in the heart of Uganda, and training new pastors to go out and start churches of their own. <a href="https://www.facebook.com/nbcuganda" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Nansana Bible Church</a>'s motto is: "Declaring the Whole Counsel of God," and they live out that motto without fear, evangelizing the city with zeal. They also work with the many children in the neighborhood, providing them with food and lessons in the Bible. It is hoped that they can influence future generations of Ugandans to grow up with a love for Christ because of how He cared for them when they were children.
      </span>,
      <span key="tayebwa-desc-2">
        They are beginning to make plans for a new church plant in the city of Mbarara. It will be a time of great transition for them as they hand off leadership roles to the existing church in Nansana and move to start a new one. It is our goal to help them stand as a beacon of hope to those around them in a city stricken by poverty and hopelessness. Perhaps they can transform Kampala and Mbarara into churches on fire for Christ!
      </span>
    ]
  }
];

const MissionaryCard = ({ missionary }: { missionary: Missionary }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100 p-6">
      <div className="mb-4">
        <h3 className="text-xl font-bold text-gray-900">{missionary.name}</h3>
        {missionary.organization && (
          <p className="text-blue-700 font-medium">{missionary.organization}</p>
        )}
        {missionary.location && (
          <p className="text-gray-600 text-sm flex items-center mt-1">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {missionary.location}
          </p>
        )}
      </div>
      
      <div className="space-y-4">
        {missionary.description.map((paragraph, idx) => (
          <div key={idx} className="text-gray-700">
            {typeof paragraph === 'string' ? (
              <p>{paragraph}</p>
            ) : (
              paragraph
            )}
          </div>
        ))}
      </div>
      
      {missionary.website && (
        <div className="mt-4">
          <a 
            href={missionary.website} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline inline-flex items-center text-sm"
          >
            Visit Website
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      )}
    </div>
  );
};

export default function Missionaries() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-gray-200 to-gray-300 py-6 md:py-8">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Missionaries We Support</h1>
          <p className="text-sm sm:text-base text-gray-700 max-w-3xl mx-auto">
            Missionary efforts we financially support
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 sm:py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Mission Partners</h2>
            <p className="text-gray-600">
              We are honored to support these dedicated missionaries and organizations who are spreading the Gospel around the world. 
              Your prayers and financial support help make their work possible.
            </p>
          </div>

          <div className="space-y-8">
            {missionaries.map((missionary, index) => (
              <MissionaryCard key={index} missionary={missionary} />
            ))}
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 text-center">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Get Involved</h3>
            <p className="text-gray-600 mb-4">
              Interested in learning more about our missionaries or signing up for their newsletters?
            </p>
            <p className="text-gray-600 mb-6">
              Please reach out to church leadership for more information about supporting these important ministries.
            </p>
            <a
              href="mailto:orchardhillsbiblechurch@gmail.com?subject=Missions%20Inquiry"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Contact Us About Missions
              <svg className="ml-2 -mr-1 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
