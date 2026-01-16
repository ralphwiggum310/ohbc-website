'use client';

import React, { useState } from 'react';
import { StatementsViewer } from '../components/StatementsViewer';
import HeroSection from '@/components/HeroSection';

// Doctrinal Statements
const doctrinalStatements = [
  {
    title: 'The Holy Scriptures',
    content: 'We believe in the verbal and plenary inspiration of the Scriptures, consisting of 66 books which constitute the Old and New Testaments, the Word of God, inerrant in the original writings, the complete and unalterable special revelation of God, and our final authority. We believe in the normal, literal, and consistent interpretation of the Scriptures; and a dispensational understanding of God\'s progressive revelation.',
    verses: 'Matthew 5:18; 2 Timothy 3:16-17; 2 Peter 1:20-21'
  },
  {
    title: 'The Godhead',
    content: 'We believe in the one triune God, eternally existing in three persons - Father, Son, and Holy Spirit - co-eternal in being, co-identical in nature, co-equal in power and glory, and having the same attributes and perfections. Singularity, plurality, and equality are essential aspects of the Trinity',
    verses: 'Deuteronomy 6:4; 2 Corinthians 13:14'
  },
  {
    title: 'The Person and Work of Christ',
    content: 'We believe the Lord Jesus Christ, the eternal Son of God, became man, without ceasing to be God, having been conceived by the Holy Spirit and born of the virgin Mary, and that He lived a sinless life. He came in order to reveal God and redeem sinful man.\n\nWe believe the Lord Jesus Christ accomplished our redemption through His death on the cross as a representative, vicarious, substitutionary sacrifice in providing a propitiation for the sins of the whole world, and that our justification is verified by His literal, physical resurrection from the dead.\n\nWe believe the Lord Jesus Christ ascended to heaven and is now exalted at the right hand of God where, as our High Priest, He fulfills the ministry of Representative, Intercessor, and Advocate.',
    verses: 'Luke 1:35; John 1:1-2; John 1:14; John 1:18; Romans 3:24-25; Ephesians 1:7; Hebrews 2:9; 1 Peter 1:3-5; 1 Peter 2:24; 1 John 2:1-2; Acts 1:9-10; Romans 8:34; Hebrews 7:25; Hebrews 9:24'
  },
  {
    title: 'The Person and Work of the Holy Spirit',
    content: 'We believe the Holy Spirit is the person of the Godhead who in this present age convicts the world of sin, righteousness, and judgment. He regenerates and baptizes into the body of Christ those who believe and He indwells and seals them unto the day of redemption.\n\nWe believe the Holy Spirit is the Divine Teacher who guides believers into all truth. It is the privilege of believers to be filled with, and their duty to walk in, the Holy Spirit.',
    verses: 'Acts 5:3-4; John 16:8-11; Romans 8:9; 1 Corinthians 12:12-14; 2 Corinthians 3:6; Ephesians 1:13-14; John 16:13; Galatians 5:16; Ephesians 5:18; 1 John 2:20; 1 John 2:27'
  },
  {
    title: 'Man\'s Origin and Nature',
    content: 'We believe man was created in the image and likeness of God out of the dust of the ground and not through an evolutionary process. In his original state, man was "very good". In Adam\'s sin the entire human race fell, inherited a sinful nature, and became alienated from God. Therefore, man is totally depraved and apart from God is unable to remedy his lost condition. Furthermore, the unregenerate man is an enemy of God and follows the promptings of Satan and his own flesh.',
    verses: 'Genesis 1:26-27; Genesis 2:7; Romans 3:22-23; Romans 5:10-12; Ephesians 2:1-3; Ephesians 2:12'
  },
  {
    title: 'Salvation and Security',
    content: 'We believe the Lord Jesus Christ died for our sins according to the Scriptures as a representative and substitutionary sacrifice for all people. All who trust Him are saved by His grace through faith on the basis of His shed blood and not human efforts. Believers are then kept by God\'s power, thus secured in Christ forever.\n\nWe believe every saved person is a new creation with provision made for victory over sin through the power of the indwelling Holy Spirit. The sin that is present in us is not eradicated in this life.\n\nWe believe it is the privilege of believers to rejoice in the assurance of their salvation through the testimony of God\'s Word which clearly forbids the use of Christian liberty as an occasion to the flesh.',
    verses: 'John 1:12; John 6:37-40; John 10:27-30; Romans 8:1; Romans 8:38-39; 1 Corinthians 1:4-8; Ephesians 1:6-7; Ephesians 2:8-10; 1 Peter 1:5; 1 Peter 1:18-19; Romans 6:13; Romans 8:12-13; Galatians 5:16-25; Ephesians 4:22-24; Colossians 3:9-10; 1 Peter 1:14-16; 1 John 3:5-9; Romans 13:13-14; Galatians 5:13; Titus 2:11-15; 1 Peter 2:13-20'
  },
  {
    title: 'The Church',
    content: 'We believe that the Church, which began with the baptizing work of the Holy Spirit on the day of Pentecost, is the body and bride of Christ. It is the spiritual organism made up of all born-again persons of the present age.',
    verses: 'Acts 2:1-13; Acts 2:47; 1 Corinthians 12:13-14; 2 Corinthians 11:2; Ephesians 1:22-23; Ephesians 5:25-27'
  },
  {
    title: 'The Ordinances',
    content: 'We believe that the Lord Jesus Christ established two ordinances for the Church in this present age. These are believer\'s water baptism, practiced by immersion, and the Lord\'s Supper, observed obediently as a memorial of His death. These ordinances are not a means of saving grace.',
    verses: 'Acts 8:12, 35-39; 10:47-48; 1 Corinthians 1:14; 11:23-34'
  },
  {
    title: 'Missions',
    content: 'We believe it is the obligation of the saved to witness by life and by word to the truths of the gospel and to proclaim these truths to all mankind. We believe the primary responsibility for the fulfillment of the Great Commission is given to the local church.',
    verses: 'Matthew 28:18-20; Acts 1:8; 2 Corinthians 5:19-20'
  },
  {
    title: 'The Eternal State',
    content: 'We believe in the bodily resurrection of all men - the saved to eternal life, and the unsaved to judgment and everlasting punishment. We believe the souls of the redeemed are, at death, absent from the body and present with the Lord, where in conscious bliss they await the first resurrection, when spirit, soul, and body are reunited to be glorified forever with the Lord. We believe the souls of unbelievers remain after death in conscious misery until the second resurrection, when with soul and body reunited they shall appear at the Great White Throne Judgment, and shall be cast into the Lake of Fire, not to be annihilated, but to suffer everlasting conscious punishment.',
    verses: 'Daniel 12:2; Matthew 25:46; John 5:28-29; John 11:25-26; Revelation 20:5-6; Revelation 20:12-13; Luke 23:43; 2 Corinthians 5:8; Philippians 1:23; Philippians 3:21; 1 Thessalonians 4:16-17; Revelation 20:4-6; Matthew 25:41-46; Mark 9:43-48; Luke 16:19-26; 2 Thessalonians 1:7-9; Jude 6-7; Revelation 20:11-15'
  },
  {
    title: 'Satan',
    content: 'We believe Satan is a person, the author of sin and the cause of the Fall of Man; that he is the open and declared enemy of God and man; and that he shall be eternally punished in the Lake of Fire.',
    verses: 'Job 1:6-7; Isaiah 14:12-17; Matthew 4:2-11; Matthew 25:41; Revelation 20:10'
  },
  {
    title: 'The Second Advent of Christ',
    content: 'We believe in the personal, imminent, pre-tribulational and pre-millennial coming of the Lord Jesus Christ for His redeemed ones; and in His subsequent return to earth, with His saints, to establish His Millennial Kingdom.',
    verses: 'Zechariah 14:4-11; 1 Thessalonians 1:10; 1 Thessalonians 4:13-18; 1 Thessalonians 5:9; Titus 2:13; Revelation 3:10; Revelation 19:11-16; Revelation 20:1-6'
  },
  {
    title: 'Separation and Unity',
    content: 'We believe the saved should be separated unto the Lord Jesus Christ, necessitating holy living in all personal and ecclesiastical associations and relationships. We believe we are responsible to identify false teaching and dangerous movements where they relate to the conduct of the church\'s ministries. We believe separation is required in those instances where people, groups, and organizations whose doctrinal position is the same as the church\'s engage in contradictory practices which compromise the faith.',
    verses: 'Romans 12:1-2; Romans 14:13; 1 Corinthians 6:19-20; Titus 2:14; James 4:4-5; 1 Peter 2:9; 1 John 2:15-17; Matthew 18:15-17; Romans 16:17; 1 Corinthians 5:7-11; 2 Corinthians 6:14-18; Ephesians 4:1-6; 2 Thessalonians 3:11-14; 2 Timothy 3:1-5; Titus 3:10; 2 John 9-11'
  }
];

// Cultural Statements
const culturalStatements = [
  {
    title: 'Real Relationship',
    content: '⦁	We pursue God because relationship with Him is more than a theory.\n\nOur love for God is expressed in personal relationship with Him as we have been changed by His grace. We walk by faith and not by sight, leading us into a pursuit of holiness as we seek to please God in all respects. Christ is to have first place in all areas of our lives.',
    verses: 'Mark 10:23-31; 2 Corinthians 6:14-18; Philippians 3:7-11; Colossians 1:15-18; Hebrews 12:1-17; 1 John 1:5-2:6'
  },
  {
    title: 'Missional Priorities',
    content: '⦁	We are on mission because Christ has made us His servants.\n\nOur responsibility to God in the world is to fulfill the Great Commission by intentionally proclaiming the gospel in our community. Our responsibility to God in the church is to love one another with Christ\'s love by intentionally counting each other as more important than ourselves. We must stay alert because the days for this service are numbered.',
    verses: 'Matthew 28:16-20; Luke 12:35-38; John 9:4; John 13:34-35; Ephesians 4:11-16; Philippians 2:3-11'
  },
  {
    title: 'Biblical Authority',
    content: '⦁	We are governed by the Bible because God\'s ways are higher than ours.\n\nOur dependence on Scripture is rooted in the belief that the Bible is authoritative and sufficient to direct the affairs of our lives and reveal His purposes for us as we humbly submit to Him in all things. This conviction is particularly revealed in our commitment to sound hermeneutics, expository preaching, biblical counseling, and complementary gender roles.',
    verses: 'Romans 15:13-14; 1 Corinthians 11:3; 1 Timothy 2:9-15; 2 Timothy 3:16-17; 2 Timothy 4:1-5'
  },
  {
    title: 'Authentic Unity',
    content: '⦁	We welcome biblical variety in the church because unity is better than uniformity.\n\nOur experience in the body of Christ is defined by great harmony amidst great differences. There are diverse gifts, personalities, and ministries in the church, along with seasons of sanctifying change. Instead of stifling this variety out of fear, we treasure it and guard it as we practice biblical tolerance toward one another in love.',
    verses: 'Romans 12:3-10; 1 Corinthians 12:4-7; Ephesians 4:1-6; 1 Peter 4:7-11'
  },
  {
    title: 'Loving Hospitality',
    content: '⦁	We show genuine interest in all who attend because no one should be lost in the crowd.\n\nOur worship environment prioritizes visibility, welcoming, and belonging, showing kindness and patience toward everyone. We want to meet people wherever they are in their spiritual walk, being open to any questions they may have about the Bible.',
    verses: 'Acts 17:17; Acts 18:4; Acts 19:8-9; 1 Corinthians 13:4-7; Philippians 4:5; Hebrews 13:2'
  },
  {
    title: 'Devoted Youth',
    content: '⦁	We intentionally lead children because the next generation matters to God.\n\nOur ministry to youth seeks spiritual maturity as the goal for all, as children are vital to the unity of our church. Rooted in Scripture, we desire to partner with parents to instruct children in the fear and admonition of the Lord. Reverence for God, robust theology, and joyful fellowship are essential elements of growing by grace.',
    verses: 'Proverbs 13:22; Proverbs 14:26; Matthew 18:1-6; Ephesians 6:1-4'
  }
];

type ViewType = 'doctrinal' | 'cultural';

export default function WhatWeBelieve() {
  const [currentView, setCurrentView] = useState<ViewType>('doctrinal');

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <HeroSection 
        title={currentView === 'doctrinal' ? 'What We Believe' : 'Our Culture'}
        subtitle={currentView === 'doctrinal' 
          ? 'Our core doctrinal beliefs that guide our church community'
          : 'The values and principles that shape our church community'}
        className="bg-gradient-to-r from-blue-700 to-blue-900 text-white"
      >
        <div className="flex justify-center mt-4 space-x-4">
          <button
            onClick={() => setCurrentView('doctrinal')}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              currentView === 'doctrinal'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
            }`}
          >
            Doctrinal Statements
          </button>
          <button
            onClick={() => setCurrentView('cultural')}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              currentView === 'cultural'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
            }`}
          >
            Cultural Statements
          </button>
        </div>
      </HeroSection>

      {/* Content Section */}
      {currentView === 'doctrinal' ? (
        <StatementsViewer 
          statements={doctrinalStatements}
          title=""
          description=""
        />
      ) : (
        <StatementsViewer 
          statements={culturalStatements}
          title=""
          description=""
        />
      )}
    </div>
  );
};
