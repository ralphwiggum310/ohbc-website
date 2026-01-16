'use client';

import React, { useEffect, useState } from 'react';

interface BibleVersePopupProps {
  reference: string;
  onClose: () => void;
}

// Static verse texts for all references
const VERSE_TEXTS: Record<string, string> = {
  // The Holy Scriptures
  'Mark 10:23-31': 'And Jesus looked around and said to his disciples, "How difficult it will be for those who have wealth to enter the kingdom of God!" And the disciples were amazed at his words. But Jesus said to them again, "Children, how difficult it is to enter the kingdom of God! It is easier for a camel to go through the eye of a needle than for a rich person to enter the kingdom of God." And they were exceedingly astonished, and said to him, "Then who can be saved?" Jesus looked at them and said, "With man it is impossible, but not with God. For all things are possible with God." Peter began to say to him, "See, we have left everything and followed you." Jesus said, "Truly, I say to you, there is no one who has left house or brothers or sisters or mother or father or children or lands, for my sake and for the gospel, who will not receive a hundredfold now in this time, houses and brothers and sisters and mothers and children and lands, with persecutions, and in the age to come eternal life."',
  '2 Corinthians 6:14-18': 'Do not be unequally yoked with unbelievers. For what partnership has righteousness with lawlessness? Or what fellowship has light with darkness? What accord has Christ with Belial? Or what portion does a believer share with an unbeliever? What agreement has the temple of God with idols? For we are the temple of the living God; as God said, "I will make my dwelling among them and walk among them, and I will be their God, and they shall be my people. Therefore go out from their midst, and be separate from them, says the Lord, and touch no unclean thing; then I will welcome you, and I will be a father to you, and you shall be sons and daughters to me, says the Lord Almighty."',
  'Philippians 3:7-11': 'But whatever gain I had, I counted as loss for the sake of Christ. Indeed, I count everything as loss because of the surpassing worth of knowing Christ Jesus my Lord. For his sake I have suffered the loss of all things and count them as rubbish, in order that I may gain Christ and be found in him, not having a righteousness of my own that comes from the law, but that which comes through faith in Christ, the righteousness from God that depends on faith— that I may know him and the power of his resurrection, and may share his sufferings, becoming like him in his death, that by any means possible I may attain the resurrection from the dead.',
  'Colossians 1:15-18': 'He is the image of the invisible God, the firstborn of all creation. For by him all things were created, in heaven and on earth, visible and invisible, whether thrones or dominions or rulers or authorities—all things were created through him and for him. And he is before all things, and in him all things hold together. And he is the head of the body, the church. He is the beginning, the firstborn from the dead, that in everything he might be preeminent.',
  'Hebrews 12:1-17': 'Therefore, since we are surrounded by so great a cloud of witnesses, let us also lay aside every weight, and sin which clings so closely, and let us run with endurance the race that is set before us, looking to Jesus, the founder and perfecter of our faith, who for the joy that was set before him endured the cross, despising the shame, and is seated at the right hand of the throne of God. Consider him who endured from sinners such hostility against himself, so that you may not grow weary or fainthearted. In your struggle against sin you have not yet resisted to the point of shedding your blood. And have you forgotten the exhortation that addresses you as sons? "My son, do not regard lightly the discipline of the Lord, nor be weary when reproved by him. For the Lord disciplines the one he loves, and chastises every son whom he receives." It is for discipline that you have to endure. God is treating you as sons. For what son is there whom his father does not discipline? If you are left without discipline, in which all have participated, then you are illegitimate children and not sons. Besides this, we have had earthly fathers who disciplined us and we respected them. Shall we not much more be subject to the Father of spirits and live? For they disciplined us for a short time as it seemed best to them, but he disciplines us for our good, that we may share his holiness. For the moment all discipline seems painful rather than pleasant, but later it yields the peaceful fruit of righteousness to those who have been trained by it. Therefore lift your drooping hands and strengthen your weak knees, and make straight paths for your feet, so that what is lame may not be put out of joint but rather be healed.',
  '1 John 1:5-2:6': 'This is the message we have heard from him and proclaim to you, that God is light, and in him is no darkness at all. If we say we have fellowship with him while we walk in darkness, we lie and do not practice the truth. But if we walk in the light, as he is in the light, we have fellowship with one another, and the blood of Jesus his Son cleanses us from all sin. If we say we have no sin, we deceive ourselves, and the truth is not in us. If we confess our sins, he is faithful and just to forgive us our sins and to cleanse us from all unrighteousness. If we say we have not sinned, we make him a liar, and his word is not in us. My little children, I am writing these things to you so that you may not sin. But if anyone does sin, we have an advocate with the Father, Jesus Christ the righteous. He is the propitiation for our sins, and not for ours only but also for the sins of the whole world. And by this we know that we have come to know him, if we keep his commandments. Whoever says "I know him" but does not keep his commandments is a liar, and the truth is not in him, but whoever keeps his word, in him truly the love of God is perfected. By this we may know that we are in him: whoever says he abides in him ought to walk in the same way in which he walked.',
  '2 Timothy 3:16-17': 'All Scripture is breathed out by God and profitable for teaching, for reproof, for correction, and for training in righteousness, that the man of God may be complete, equipped for every good work.',
  '2 Peter 1:20-21': 'No prophecy of Scripture comes from someone\'s own interpretation. For no prophecy was ever produced by the will of man, but men spoke from God as they were carried along by the Holy Spirit.',
  'Matthew 28:16-20': 'Now the eleven disciples went to Galilee, to the mountain to which Jesus had directed them. And when they saw him they worshiped him, but some doubted. And Jesus came and said to them, "All authority in heaven and on earth has been given to me. Go therefore and make disciples of all nations, baptizing them in the name of the Father and of the Son and of the Holy Spirit, teaching them to observe all that I have commanded you. And behold, I am with you always, to the end of the age."',
  'Luke 12:35-38': '"Stay dressed for action and keep your lamps burning, and be like men who are waiting for their master to come home from the wedding feast, so that they may open the door to him at once when he comes and knocks. Blessed are those servants whom the master finds awake when he comes. Truly, I say to you, he will dress himself for service and have them recline at table, and he will come and serve them. If he comes in the second watch, or in the third, and finds them awake, blessed are those servants!"',
  'John 9:4': '"We must work the works of him who sent me while it is day; night is coming, when no one can work."',
  'John 13:34-35': '"A new commandment I give to you, that you love one another: just as I have loved you, you also are to love one another. By this all people will know that you are my disciples, if you have love for one another."',
  'Ephesians 4:11-16': 'And he gave the apostles, the prophets, the evangelists, the shepherds and teachers, to equip the saints for the work of ministry, for building up the body of Christ, until we all attain to the unity of the faith and of the knowledge of the Son of God, to mature manhood, to the measure of the stature of the fullness of Christ, so that we may no longer be children, tossed to and fro by the waves and carried about by every wind of doctrine, by human cunning, by craftiness in deceitful schemes. Rather, speaking the truth in love, we are to grow up in every way into him who is the head, into Christ, from whom the whole body, joined and held together by every joint with which it is equipped, when each part is working properly, makes the body grow so that it builds itself up in love.',
  'Philippians 2:3-11': 'Do nothing from selfish ambition or conceit, but in humility count others more significant than yourselves. Let each of you look not only to his own interests, but also to the interests of others. Have this mind among yourselves, which is yours in Christ Jesus, who, though he was in the form of God, did not count equality with God a thing to be grasped, but emptied himself, by taking the form of a servant, being born in the likeness of men. And being found in human form, he humbled himself by becoming obedient to the point of death, even death on a cross. Therefore God has highly exalted him and bestowed on him the name that is above every name, so that at the name of Jesus every knee should bow, in heaven and on earth and under the earth, and every tongue confess that Jesus Christ is Lord, to the glory of God the Father.',
  'Romans 15:13-14': 'May the God of hope fill you with all joy and peace in believing, so that by the power of the Holy Spirit you may abound in hope. I myself am satisfied about you, my brothers, that you yourselves are full of goodness, filled with all knowledge and able to instruct one another.',
  '1 Corinthians 11:3': 'But I want you to understand that the head of every man is Christ, the head of a wife is her husband, and the head of Christ is God.'
};

export default function BibleVersePopup({ reference, onClose }: BibleVersePopupProps) {
  const [verseText, setVerseText] = useState('Loading...');
  const [isLoading, setIsLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Set isVisible to true when component mounts to trigger the fade-in animation
    setIsVisible(true);

    // Look up the verse text from our static object
    const text = VERSE_TEXTS[reference] || 'Verse not found';
    setVerseText(text);
    setIsLoading(false);
  }, [reference]);

  const handleClose = () => {
    // Set isVisible to false to trigger the fade-out animation
    setIsVisible(false);
    // Wait for the animation to complete before calling onClose
    setTimeout(() => {
      onClose();
    }, 200); // Match this with your CSS transition time
  };

  return (
    <div 
      className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-200 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
      onClick={handleClose}
    >
      <div 
        className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold text-gray-900">{reference}</h3>
          <button 
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        <div className="text-gray-800 mb-4">
          {isLoading ? (
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          ) : (
            <p className="whitespace-pre-line">{verseText}</p>
          )}
        </div>
        
        <div className="text-right">
          <button
            onClick={handleClose}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
