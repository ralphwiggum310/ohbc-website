import Image from 'next/image';

interface TeamMember {
  name: string;
  role: string;
  bio: string[];
  image: string;
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
      image: '/images/leadership/jeremy-howard.jpg'
    },
    {
      name: 'Tyler Woodhead',
      role: 'Pastor',
      bio: [
        'Tyler Woodhead is a Utah native who has grown up well-acquainted with Mormonism and its ability to either draw or repel those who encounter it. His wife, Britny, was delivered out of Mormonism, and together the two went to Frontier Bible College in LaGrange, Wyoming where Tyler earned his Bachelor of Arts degree in Biblical Studies, with an emphasis in Pastoral Ministry.',
        'After graduating in 2012, they moved back to Ogden, Utah as church planters until the Lord directed them to Payson, Utah in 2018, where they now serve at Orchard Hills Bible Church along with their three boys.'
      ],
      image: '/images/leadership/tyler-woodhead.jpg'
    },
    {
      name: 'Michael Smith',
      role: 'Pastor',
      bio: [
        'Michael Smith was mainly raised in the Central Valley of California. He and his wife, Beth, moved to Utah in 2016. After nearly 52 years of marriage, Beth went home to be with the Lord in April 2023. Michael has two adult children, nine grandchildren, and two great-grandchildren.',
        'He has a Bachelor of Science in Nursing, as well as an MBA. Since retiring, he enjoys woodworking, hunting, and fishing as hobbies. He desires to be a part of continual growth in God\'s work in Utah.'
      ],
      image: '/images/leadership/michael-smith.jpg'
    }
  ],
  Deacons: [
    {
      name: 'Rex Dana',
      role: 'Deacon',
      bio: [
        'Rex Dana was born in Odgen, Utah. He was raised throughout Utah, Nevada, and California. He served 6 years in the US Army, three of which were in Italy and Germany. He served five years in the U.S. Air Force National Guard in Salt Lake City. While stationed there, he married Ellie on April 19, 1975. He retired in 2014 after serving 40 years in law enforcement in Utah. He and Ellie have four sons, fifteen grandchildren and three great-grandchildren.',
        'In 2006, Rex surrendered his life and soul to the Lord Jesus Christ under the leadership of Pastor Lee Whitworth here, at what was then called Payson Bible Church. He had the privilege and honor to baptize his beautiful wife Ellie after she received Jesus into her life in 2008. They have served their King together since that time and plan to continue serving until the Lord takes them to be with Him in eternity.'
      ],
      image: '/images/leadership/rex-dana.jpg'
    },
    {
      name: 'Dean Stucker',
      role: 'Deacon',
      bio: [
        'Dean Stucker was raised in Albuquerque, New Mexico. He moved to Utah in 2013 for work as the Sales Manger for Pepsi of Springville. He and Jen married in 2015 and have three great children.',
        'He enjoys camping and outdoor activities with family and friends. He has a passion for teaching and leading, especially with the younger generation. He loves being a kids\' class teacher, especially when he has the opportunity to team-teach with his wife. He desires to lead the children\'s ministry someday and oversee their direction and vision of growth as disciples of Christ preparing themselves for the Great Commission.'
      ],
      image: '/images/leadership/dean-stucker.jpg'
    },
    {
      name: 'Logan Mast',
      role: 'Deacon',
      bio: [
        'Logan Mast grew up on the plains of Montana. He was raised a Mennonite and spent three years on a mission in Costa Rica. He is married to his beautiful wife Dory and they have four boys. They moved to Utah in the fall of 2019 and year later he and his family started attending Orchard Hills Bible Church.',
        'Logan works in construction. His hobbies are hunting, fishing and trying to pass on the wonder of God\'s great outdoors to his boys. He desires to serve God to the best of his ability in our valley and through this church body.'
      ],
      image: '/images/leadership/logan-mast.jpg'
    },
    {
      name: 'Jim Carpenter',
      role: 'Deacon',
      bio: [
        'Jim Carpenter grew up in Fort Worth, Texas. After moving to Colorado, he met and married Sandra, and they lived there for 39 years. They moved to Utah to be closer to their children and grandchildren. They have two daughters, six grandchildren and eight great-grandchildren.',
        'Since retiring he has enjoyed fishing, hunting, camping, mechanical work, building, and welding. He desires to love the Lord his God with all his heart, soul, and mind.'
      ],
      image: '/images/leadership/jim-carpenter.jpg'
    }
  ],
  'Office Administrator': [
    {
      name: 'Sandra Carpenter',
      role: 'Office Administrator',
      bio: [
        'Sandra Carpenter was born and raised in Colorado. At the age of 17, she realized it was not within her ability to be what God desired. She gladly admitted she fell short and received the mercy and grace God provides for those whose hearts are changed by Him. She married Jim in 1981 and, in 2020, they decided to move to Utah to be closer to family. Finding a new church family came easy at Orchard Hills Bible Church. She has always felt that serving God is a must and a joy to reflect the changes He has worked in her life.'
      ],
      image: '/images/leadership/sandra-carpenter.jpg'
    }
  ]
};

export default function Leadership() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative py-6 md:py-8 bg-gray-200">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-2xl font-bold text-gray-800">Church Leadership</h1>
          <p className="text-gray-600 text-sm">Meet our dedicated ministry team</p>
        </div>
      </div>

      {/* Leadership Sections */}
      <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {Object.entries(leadership).map(([title, members]) => (
          <div key={title} className="mb-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 pb-2 border-b border-gray-200">
              {title}
            </h2>
            <div className="space-y-10">
              {members.map((member, index) => (
                <div 
                  key={member.name} 
                  className={`bg-white rounded-lg shadow-sm overflow-hidden ${
                    index !== members.length - 1 ? 'mb-10' : ''
                  }`}
                >
                  <div className="md:flex">
                    <div className="md:flex-shrink-0 relative w-full h-64 md:w-48 md:h-48 lg:w-56 lg:h-56 overflow-hidden rounded-2xl">
                      <Image
                        src={member.image}
                        alt={member.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 224px"
                        priority={index < 3} // Load first 3 images with higher priority
                      />
                    </div>
                    <div className="p-6 pt-0 md:pt-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">
                        {member.name}
                      </h3>
                      {member.bio.map((paragraph, pIndex) => (
                        <p key={pIndex} className="text-gray-600 mb-4 last:mb-0">
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
