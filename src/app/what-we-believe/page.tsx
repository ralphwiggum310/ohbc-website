'use client';

import React from 'react';

const beliefs: Array<{title: string; content: string; verses: string}> = [
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
    verses: 'Luke 1:35; John 1:1-2,14,18; Romans 3:24-25; Ephesians 1:7; Hebrews 2:9; 1 Peter 1:3-5; 2:24; 1 John 2:2; Acts 1:9-10; Romans 8:34; Hebrews 7:25; 9:24; 1 John 2:1-2'
  },
  {
    title: 'The Person and Work of the Holy Spirit',
    content: 'We believe the Holy Spirit is the person of the Godhead who in this present age convicts the world of sin, righteousness, and judgment. He regenerates and baptizes into the body of Christ those who believe and He indwells and seals them unto the day of redemption.\n\nWe believe the Holy Spirit is the Divine Teacher who guides believers into all truth. It is the privilege of believers to be filled with, and their duty to walk in, the Holy Spirit.',
    verses: 'Acts 5:3-4; John 16:8-11, 13; Romans 8:9; 1 Corinthians 12:12-14; 2 Corinthians 3:6; Ephesians 1:13-14; 5:18; Galatians 5:16; 1 John 2:20,27'
  },
  {
    title: 'Man\'s Origin and Nature',
    content: 'We believe man was created in the image and likeness of God out of the dust of the ground and not through an evolutionary process. In his original state, man was "very good". In Adam\'s sin the entire human race fell, inherited a sinful nature, and became alienated from God. Therefore, man is totally depraved and apart from God is unable to remedy his lost condition. Furthermore, the unregenerate man is an enemy of God and follows the promptings of Satan and his own flesh.',
    verses: 'Genesis 1:26-27, 2:7; Romans 3:22-23; 5:10-12; Ephesians 2:1-3,12'
  },
  {
    title: 'Salvation and Security',
    content: 'We believe the Lord Jesus Christ died for our sins according to the Scriptures as a representative and substitutionary sacrifice for all people. All who trust Him are saved by His grace through faith on the basis of His shed blood and not human efforts. Believers are then kept by God\'s power, thus secured in Christ forever.\n\nWe believe every saved person is a new creation with provision made for victory over sin through the power of the indwelling Holy Spirit. The sin that is present in us is not eradicated in this life.\n\nWe believe it is the privilege of believers to rejoice in the assurance of their salvation through the testimony of God\'s Word which clearly forbids the use of Christian liberty as an occasion to the flesh.',
    verses: 'John 1:12; 6:37-40; 10:27-30; Romans 6:13; 8:1,12-13,38-39; 1 Corinthians 1:4-8; 2 Corinthians 5:17; Galatians 5:13,16-25; Ephesians 1:6-7; 2:8-10; 4:22-24; Colossians 3:9-10; 1 Peter 1:5,14-16,18-19; 1 John 3:5-9; Romans 13:13-14; Titus 2:11-15; 1 Peter 2:13-20'
  },
  {
    title: 'The Church',
    content: 'We believe that the Church, which began with the baptizing work of the Holy Spirit on the day of Pentecost, is the body and bride of Christ. It is the spiritual organism made up of all born-again persons of the present age.\n\nWe believe that the establishment and continuance of local churches is clearly taught and defined in the New Testament Scriptures. Furthermore, God\'s purpose of granting spiritual gifts to His people is for service in the local church.',
    verses: 'Acts 2:1-13,47; 14:27; 20:17,28-32; Romans 12:3-8; 1 Corinthians 12; Ephesians 1:22-23; 4:7-14; 5:25-27; 1 Peter 4:10-11; 1 Timothy 3:1-13; Titus 1:5-11'
  },
  {
    title: 'Ordinances',
    content: 'We believe that the Lord Jesus Christ established two ordinances for the Church in this present age. These are believer\'s water baptism, practiced by immersion, and the Lord\'s Supper, observed obediently as a memorial of His death. These ordinances are not a means of saving grace.',
    verses: 'Acts 8:12,35-39; 10:47-48; 1 Corinthians 1:14; 11:23-34'
  },
  {
    title: 'Missions',
    content: 'We believe that Christ commissioned individuals in the church to make disciples from among all nations, to baptize them in the name of the Father, the Son, and the Holy Spirit, and to teach them to observe all things whatsoever He has commanded.',
    verses: 'Matthew 28:18-20; Acts 1:8; 2 Corinthians 5:19-20'
  },
  {
    title: 'The Ministry and Spiritual Gifts',
    content: 'We believe the Lord Jesus Christ gives the Church evangelists and pastor-teachers. These gifted men are to equip the saints for the work of the ministry.\n\nWe believe the Holy Spirit bestows spiritual gifts upon believers for Christian service and the edification of the Church.\n\nWe believe the church age was initiated through the ministry of the apostles and prophets accompanied by sign gifts to confirm their message. These sign gifts gradually ceased by the time of the completion of the New Testament.\n\nWe believe God hears and answers prayer in accord with His own will for healing of the sick and afflicted.',
    verses: 'John 14:13-14; 15:7; Romans 12:3-8; 1 Corinthians 12:4-11,28-31; 13:8-10; 14:1-28; 2 Corinthians 12:12; Ephesians 2:19-22; 4:7-14; Hebrews 2:3-4; 1 John 5:14-15'
  },
  {
    title: 'Dispensationalism',
    content: 'We believe the Scriptures interpreted in their natural, literal sense reveal divinely determined dispensations, which define man\'s responsibility in successive ages. A dispensation is not a way of salvation, but a divinely-ordered stewardship by which God directs man according to His purpose.\n\nWe believe salvation is always by grace through faith regardless of the dispensation in which the believer may have lived. God\'s purpose of salvation by grace through faith alone has always been based upon the substitutionary atonement of our Lord Jesus Christ upon the cross.',
    verses: 'John 1:17; 1 Corinthians 9:17; 2 Corinthians 3:9-18; Galatians 3:13-25; Ephesians 1:10; 2:8-10; 3:2-10; Colossians 1:24-25; Hebrews 7:19; 11:6; 1 Peter 1:10-12; Revelation 20:2-6'
  },
  {
    title: 'The Personality of Satan',
    content: 'We believe Satan is a created being, the author of sin, the tempter in the fall, the declared enemy of God and man, and the god of this age. He shall be eternally punished in the lake of fire.',
    verses: 'Job 1:6-7; Isaiah 14:12-17; Matthew 4:2-11; 25:41; Revelation 20:10'
  },
  {
    title: 'Future Things',
    content: 'We believe in the "Blessed Hope," the personal, imminent, pre-tribulational and pre-millennial coming of the Lord Jesus Christ for His redeemed ones. We believe that at the end of the seven-year tribulation He will return to earth with the saints in power and glory to reign for a thousand years.\n\nWe believe in the bodily resurrection of all men: the saved to eternal life and the unsaved to judgment and everlasting punishment.\n\nWe believe that the souls of the redeemed are, at death, absent from the body and present with the Lord. In conscious bliss they await the first resurrection, when the physical body and the non-physical soul are reunited to be glorified forever with the Lord.\n\nWe believe the souls of unbelievers are, at death, absent from the body and in conscious misery until the second resurrection, when with soul and body reunited they shall appear at the Great White Throne Judgment and shall be cast into the Lake of Fire. There they will not be annihilated, but suffer everlasting conscious punishment.',
    verses: 'Zechariah 14:4-11; Daniel 12:2; Matthew 25:41-46,46; Mark 9:43-48; Luke 16:19-26; 23:43; John 5:28-29; 11:25-26; 2 Corinthians 5:8; Philippians 1:23; 3:21; 1 Thessalonians 1:10; 4:13-18; 5:9; 2 Thessalonians 1:7-9; Titus 2:13; 1 John 3:2; Jude 6-7; Revelation 3:10; 19:11-16; 20:1-6,11-15'
  },
  {
    title: 'Creation',
    content: 'We believe the triune God, by a free act and for His own glory, without the use of existing materials or secondary causes, brought into being - immediately and instantaneously in six literal days by the word of His mouth - the whole visible and invisible universe.',
    verses: 'Genesis 1:1-27; Exodus 20:8-11; Nehemiah 9:6; Psalm 104:25-26; Isaiah 40:21-31; John 1:1-5; Colossians 1:16-17'
  },
  {
    title: 'Human Sexuality',
    content: 'Sexual intimacy is a wonderful gift of God that is only to be expressed between a man and a woman within the love and bonds of marriage. Therefore, we believe that any other form of sexual intimacy is both immoral and a perversion of God\'s gift.',
    verses: 'Genesis 2:24-25; Proverbs 5:18; 6:32; 1 Corinthians 6:18; 7:5; Romans 1:26-27; 1 Thessalonians 4:3-5; Hebrews 13:4; Leviticus 18:1-30'
  },
  {
    title: 'Separation and Unity',
    content: 'We believe the saved should be separated unto the Lord Jesus Christ, necessitating holy living in all personal and ecclesiastical associations and relationships. We believe we are responsible to identify false teaching and dangerous movements where they relate to the conduct of the church\'s ministries. We believe separation is required in those instances where people, groups, and organizations whose doctrinal position is the same as the church\'s engage in contradictory practices which compromise the faith.',
    verses: 'Romans 12:1-2; 14:13; 16:17; 1 Corinthians 5:7-11; 6:19-20; 2 Corinthians 6:14-18; Ephesians 4:1-6; 2 Thessalonians 3:11-14; 2 Timothy 3:1-5; Titus 2:14; 3:10; James 4:4-5; 1 Peter 2:9; 2 John 9-11; 1 John 2:15-17; Matthew 18:15-17'
  }
];

// Simple gradient background component
const GradientCard = ({ title, content, verses, isEven }: { 
  title: string; 
  content: string; 
  verses: string; 
  isEven: boolean;
}) => {
  const baseGradient = isEven 
    ? 'from-gray-100 to-gray-200' 
    : 'from-gray-200 to-gray-300';

  return (
    <div className={`rounded-lg p-4 sm:p-6 md:p-7 transition-all duration-500 bg-gradient-to-r ${baseGradient}`}>
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">{title}</h2>
      <p className="text-gray-700 mb-4 leading-relaxed whitespace-pre-line">
        {content}
      </p>
      <p className="text-sm text-gray-500 italic">
        <span className="font-semibold">Key Verses:</span> {verses}
      </p>
    </div>
  );
};

export default function WhatWeBelieve() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-gray-200 to-gray-300 py-6 md:py-8">
        <div className="container mx-auto px-3 sm:px-4 text-center">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2 sm:mb-3">What We Believe</h1>
          <p className="text-sm sm:text-base md:text-lg text-gray-700 max-w-3xl mx-auto">
            Our core doctrinal beliefs that guide our church community
          </p>
        </div>
      </div>

      {/* Beliefs Section */}
      <div className="container mx-auto px-3 sm:px-4 py-8 sm:py-10">
        <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
          {beliefs.map((belief, index) => (
            <GradientCard 
              key={index}
              title={belief.title}
              content={belief.content}
              verses={belief.verses}
              isEven={index % 2 === 0}
            />
          ))}
        </div>
      </div>
      <div className="mt-8 bg-white p-6 rounded-lg shadow-sm border-t-2 border-gray-200">
        <p className="text-sm text-gray-500 italic">
          (Scripture verses are representative, and not to be considered exhaustive.)
        </p>
      </div>
    </div>
  );
}
