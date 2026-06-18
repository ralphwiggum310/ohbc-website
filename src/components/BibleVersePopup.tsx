'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';

interface BibleVersePopupProps {
  reference: string;
  onCloseAction: () => void;
  isOpen: boolean;
}

// Static verse texts for all references
const VERSE_TEXTS: Record<string, string> = {
  // The Holy Scriptures
  'Matthew 5:18': 'For truly, I say to you, until heaven and earth pass away, not an iota, not a dot, will pass from the Law until all is accomplished.',
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
  '1 Corinthians 11:3': 'But I want you to understand that the head of every man is Christ, the head of a wife is her husband, and the head of Christ is God.',
  
  // The Godhead
  'Deuteronomy 6:4': 'Hear, O Israel: The LORD our God, the LORD is one.',
  '2 Corinthians 13:14': 'The grace of the Lord Jesus Christ and the love of God and the fellowship of the Holy Spirit be with you all.',
  
  // Person and Work of Christ
  'Luke 1:35': 'And the angel answered her, "The Holy Spirit will come upon you, and the power of the Most High will overshadow you; therefore the child to be born will be called holy—the Son of God."',
  'John 1:1-2': 'In the beginning was the Word, and the Word was with God, and the Word was God. He was in the beginning with God.',
  'John 1:14': 'And the Word became flesh and dwelt among us, and we have seen his glory, glory as of the only Son from the Father, full of grace and truth.',
  'John 1:18': 'No one has ever seen God; the only God, who is at the Father\'s side, he has made him known.',
  'Romans 3:24-25': 'And are justified by his grace as a gift, through the redemption that is in Christ Jesus, whom God put forward as a propitiation by his blood, to be received by faith. This was to show God\'s righteousness, because in his divine forbearance he had passed over former sins.',
  'Romans 8:34': 'Who is to condemn? Christ Jesus is the one who died—more than that, who was raised—who is at the right hand of God, who indeed is interceding for us.',
  'Ephesians 1:7': 'In him we have redemption through his blood, the forgiveness of our trespasses, according to the riches of his grace,',
  'Hebrews 2:9': 'But we see him who for a little while was made lower than the angels, namely Jesus, crowned with glory and honor because of the suffering of death, so that by the grace of God he might taste death for everyone.',
  'Hebrews 7:25': 'Consequently, he is able to save to the uttermost those who draw near to God through him, since he always lives to make intercession for them.',
  'Hebrews 9:24': 'For Christ has entered, not into holy places made with hands, which are copies of the true things, but into heaven itself, now to appear in the presence of God on our behalf.',
  '1 John 2:1-2': 'My little children, I am writing these things to you so that you may not sin. But if anyone does sin, we have an advocate with the Father, Jesus Christ the righteous. He is the propitiation for our sins, and not for ours only but also for the sins of the whole world.',
  '1 Peter 1:3-5': 'Blessed be the God and Father of our Lord Jesus Christ! According to his great mercy, he has caused us to be born again to a living hope through the resurrection of Jesus Christ from the dead, to an inheritance that is imperishable, undefiled, and unfading, kept in heaven for you, who by God\'s power are being guarded through faith for a salvation ready to be revealed in the last time.',
  '1 Peter 2:24': 'He himself bore our sins in his body on the tree, that we might die to sin and live to righteousness. By his wounds you have been healed.',
  'Acts 1:9-10': 'And when he had said these things, as they were looking on, he was lifted up, and a cloud took him out of their sight. And while they were gazing into heaven as he went, behold, two men stood by them in white robes,',
  
  // Person and Work of the Holy Spirit
  'John 16:8-11': 'And when he comes, he will convict the world concerning sin and righteousness and judgment: concerning sin, because they do not believe in me; concerning righteousness, because I go to the Father, and you will see me no longer; concerning judgment, because the ruler of this world is judged.',
  'John 16:13': 'When the Spirit of truth comes, he will guide you into all the truth, for he will not speak on his own authority, but whatever he hears he will speak, and he will declare to you the things that are to come.',
  'Acts 5:3-4': 'But Peter said, "Ananias, why has Satan filled your heart to lie to the Holy Spirit and to keep back for yourself part of the proceeds of the land? While it remained unsold, did it not remain your own? And after it was sold, was it not at your disposal? Why is it that you have contrived this deed in your heart? You have not lied to man but to God."',
  'Romans 8:9': 'You, however, are not in the flesh but in the Spirit, if in fact the Spirit of God dwells in you. Anyone who does not have the Spirit of Christ does not belong to him.',
  '1 Corinthians 12:12-14': 'For just as the body is one and has many members, and all the members of the body, though many, are one body, so it is with Christ. For in one Spirit we were all baptized into one body—Jews or Greeks, slaves or free—and all were made to drink of one Spirit. For the body does not consist of one member but of many.',
  '2 Corinthians 3:6': 'Who has made us sufficient to be ministers of a new covenant, not of the letter but of the Spirit. For the letter kills, but the Spirit gives life.',
  'Ephesians 1:13-14': 'In him you also, when you heard the word of truth, the gospel of your salvation, and believed in him, were sealed with the promised Holy Spirit, who is the guarantee of our inheritance until we acquire possession of it, to the praise of his glory.',
  'Ephesians 5:18': 'And do not get drunk with wine, for that is debauchery, but be filled with the Spirit,',
  'Galatians 5:16': 'But I say, walk by the Spirit, and you will not gratify the desires of the flesh.',
  'Galatians 5:25': 'If we live by the Spirit, let us also keep in step with the Spirit.',
  '1 John 2:20': 'But you have been anointed by the Holy One, and you all have knowledge.',
  '1 John 2:27': 'But the anointing that you received from him abides in you, and you have no need that anyone should teach you. But as his anointing teaches you about everything, and is true, and is no lie—just as it has taught you, abide in him.',
  
  // Man's Origin and Nature
  'Genesis 1:26-27': 'Then God said, "Let us make man in our image, after our likeness. And let them have dominion over the fish of the sea and over the birds of the heavens and over the livestock and over all the earth and over every creeping thing that creeps on the earth." So God created man in his own image, in the image of God he created him; male and female he created them.',
  'Genesis 2:7': 'Then the LORD God formed the man of dust from the ground and breathed into his nostrils the breath of life, and the man became a living creature.',
  'Romans 3:22-23': 'The righteousness of God through faith in Jesus Christ for all who believe. For there is no distinction: for all have sinned and fall short of the glory of God,',
  'Romans 5:10-12': 'For if while we were enemies we were reconciled to God by the death of his Son, much more, now that we are reconciled, shall we be saved by his life. More than that, we also rejoice in God through our Lord Jesus Christ, through whom we have now received reconciliation. Therefore, just as sin came into the world through one man, and death through sin, and so death spread to all men because all sinned—',
  'Ephesians 2:1-3': 'And you were dead in the trespasses and sins in which you once walked, following the course of this world, following the prince of the power of the air, the spirit that is now at work in the sons of disobedience—among whom we all once lived in the passions of our flesh, carrying out the desires of the body and the mind, and were by nature children of wrath, like the rest of mankind.',
  'Ephesians 2:12': 'Remember that you were at that time separated from Christ, alienated from the commonwealth of Israel and strangers to the covenants of promise, having no hope and without God in the world.',
  
  // Salvation and Security
  'John 1:12': 'But to all who did receive him, who believed in his name, he gave the right to become children of God,',
  'John 6:37-40': 'All that the Father gives me will come to me, and whoever comes to me I will never cast out. For I have come down from heaven, not to do my own will but the will of him who sent me. And this is the will of him who sent me, that I should lose nothing of all that he has given me, but raise it up on the last day. For this is the will of my Father, that everyone who looks on the Son and believes in him should have eternal life, and I will raise him up on the last day."',
  'John 10:27-30': 'My sheep hear my voice, and I know them, and they follow me. I give them eternal life, and they will never perish, and no one will snatch them out of my hand. My Father, who has given them to me, is greater than all, and no one is able to snatch them out of the Father\'s hand. I and the Father are one."',
  'Romans 6:13': 'Do not present your members to sin as instruments for unrighteousness, but present yourselves to God as those who have been brought from death to life, and your members to God as instruments for righteousness.',
  'Romans 8:1': 'There is therefore now no condemnation for those who are in Christ Jesus.',
  'Romans 8:12-13': 'So then, brothers, we are debtors, not to the flesh, to live according to the flesh. For if you live according to the flesh you will die, but if by the Spirit you put to death the deeds of the body, you will live.',
  'Romans 8:38-39': 'For I am sure that neither death nor life, nor angels nor rulers, nor things present nor things to come, nor powers, nor height nor depth, nor anything else in all creation, will be able to separate us from the love of God in Christ Jesus our Lord.',
  'Romans 13:13-14': 'Let us walk properly as in the daytime, not in orgies and drunkenness, not in sexual immorality and sensuality, not in quarreling and jealousy. But put on the Lord Jesus Christ, and make no provision for the flesh, to gratify its desires.',
  '1 Corinthians 1:4-8': 'I give thanks to my God always for you because of the grace of God that was given you in Christ Jesus, that in every way you were enriched in him in all speech and all knowledge—even as the testimony about Christ was confirmed among you—so that you are not lacking in any gift, as you wait for the revealing of our Lord Jesus Christ, who will sustain you to the end, guiltless in the day of our Lord Jesus Christ.',
  '2 Corinthians 5:17': 'Therefore, if anyone is in Christ, he is a new creation. The old has passed away; behold, the new has come.',
  'Galatians 5:13': 'For you were called to freedom, brothers. Only do not use your freedom as an opportunity for the flesh, but through love serve one another.',
  'Galatians 5:16-25': 'But I say, walk by the Spirit, and you will not gratify the desires of the flesh. For the desires of the flesh are against the Spirit, and the desires of the Spirit are against the flesh, for these are opposed to each other, to keep you from doing the things you want to do. But if you are led by the Spirit, you are not under the law. Now the works of the flesh are evident: sexual immorality, impurity, sensuality, idolatry, sorcery, enmity, strife, jealousy, fits of anger, rivalries, dissensions, divisions, envy, drunkenness, orgies, and things like these. I warn you, as I warned you before, that those who do such things will not inherit the kingdom of God. But the fruit of the Spirit is love, joy, peace, patience, kindness, goodness, faithfulness, gentleness, self-control; against such things there is no law. And those who belong to Christ Jesus have crucified the flesh with its passions and desires. If we live by the Spirit, let us also keep in step with the Spirit.',
  'Ephesians 1:6-7': 'To the praise of his glorious grace, with which he has blessed us in the Beloved. In him we have redemption through his blood, the forgiveness of our trespasses, according to the riches of his grace,',
  'Ephesians 2:8-10': 'For by grace you have been saved through faith. And this is not your own doing; it is the gift of God, not a result of works, so that no one may boast. For we are his workmanship, created in Christ Jesus for good works, which God prepared beforehand, that we should walk in them.',
  'Ephesians 4:22-24': 'To put off your old self, which belongs to your former manner of life and is corrupt through deceitful desires, and to be renewed in the spirit of your minds, and to put on the new self, created after the likeness of God in true righteousness and holiness.',
  'Colossians 3:9-10': 'Do not lie to one another, seeing that you have put off the old self with its practices and have put on the new self, which is being renewed in knowledge after the image of its creator.',
  'Titus 2:11-15': 'For the grace of God has appeared, bringing salvation for all people, training us to renounce ungodliness and worldly passions, and to live self-controlled, upright, and godly lives in the present age, waiting for our blessed hope, the appearing of the glory of our great God and Savior Jesus Christ, who gave himself for us to redeem us from all lawlessness and to purify for himself a people for his own possession who are zealous for good works. Declare these things; exhort and rebuke with all authority. Let no one disregard you.',
  '1 Peter 1:5': 'Who by God\'s power are being guarded through faith for a salvation ready to be revealed in the last time.',
  '1 Peter 1:14-16': 'As obedient children, do not be conformed to the passions of your former ignorance, but as he who called you is holy, you also be holy in all your conduct, since it is written, "You shall be holy, for I am holy."',
  '1 Peter 1:18-19': 'Knowing that you were ransomed from the futile ways inherited from your forefathers, not with perishable things such as silver or gold, but with the precious blood of Christ, like that of a lamb without blemish or spot.',
  '1 Peter 2:13-20': 'Be subject for the Lord\'s sake to every human institution, whether it be to the emperor as supreme, or to governors as sent by him to punish those who do evil and to praise those who do good. For this is the will of God, that by doing good you should put to silence the ignorance of foolish people. Live as people who are free, not using your freedom as a cover-up for evil, but living as servants of God. Honor everyone. Love the brotherhood. Fear God. Honor the emperor. Servants, be subject to your masters with all respect, not only to the good and gentle but also to the unjust. For this is a gracious thing, when, mindful of God, one endures sorrows while suffering unjustly. For what credit is it if, when you sin and are beaten for it, you endure? But if when you do good and suffer for it you endure, this is a gracious thing in the sight of God.',
  '1 John 3:5-9': 'You know that he appeared to take away sins, and in him there is no sin. No one who abides in him keeps on sinning; no one who keeps on sinning has either seen him or known him. Little children, let no one deceive you. Whoever practices righteousness is righteous, as he is righteous. Whoever makes a practice of sinning is of the devil, for the devil has been sinning from the beginning. The reason the Son of God appeared was to destroy the works of the devil. No one born of God makes a practice of sinning, for God\'s seed abides in him; and he cannot keep on sinning, because he has been born of God.',
  
  // The Church and Ordinances
  'Acts 2:1-13': 'When the day of Pentecost arrived, they were all together in one place. And suddenly there came from heaven a sound like a mighty rushing wind, and it filled the entire house where they were sitting. And divided tongues as of fire appeared to them and rested on each one of them. And they were all filled with the Holy Spirit and began to speak in other tongues as the Spirit gave them utterance. Now there were dwelling in Jerusalem Jews, devout men from every nation under heaven. And at this sound the multitude came together, and they were bewildered, because each one was hearing them speak in his own language. And they were amazed and astonished, saying, "Are not all these who are speaking Galileans? And how is it that we hear, each of us in his own native language? Parthians and Medes and Elamites and residents of Mesopotamia, Judea and Cappadocia, Pontus and Asia, Phrygia and Pamphylia, Egypt and the parts of Libya belonging to Cyrene, and visitors from Rome, both Jews and proselytes, Cretans and Arabians—we hear them telling in our own tongues the mighty works of God." And all were amazed and perplexed, saying to one another, "What does this mean?" But others mocking said, "They are filled with new wine."',
  'Acts 2:47': 'Praising God and having favor with all the people. And the Lord added to their number day by day those who were being saved.',
  '1 Corinthians 12:13-14': 'For in one Spirit we were all baptized into one body—Jews or Greeks, slaves or free—and all were made to drink of one Spirit. For the body does not consist of one member but of many.',
  '2 Corinthians 11:2': 'For I feel a divine jealousy for you, since I betrothed you to one husband, to present you as a pure virgin to Christ.',
  'Ephesians 1:22-23': 'And he put all things under his feet and gave him as head over all things to the church, which is his body, the fullness of him who fills all in all.',
  'Ephesians 5:25-27': 'Husbands, love your wives, as Christ loved the church and gave himself up for her, that he might sanctify her, having cleansed her by the washing of water with the word, so that he might present the church to himself in splendor, without spot or wrinkle or any such thing, that she might be holy and without blemish.',
  'Acts 8:12': 'But when they believed Philip as he preached good news about the kingdom of God and the name of Jesus Christ, they were baptized, both men and women.',
  'Acts 8:35-39': 'Then Philip opened his mouth, and beginning with this Scripture he told him the good news about Jesus. And as they were going along the road they came to some water, and the eunuch said, "See, here is water! What prevents me from being baptized?" And he commanded the chariot to stop, and they both went down into the water, Philip and the eunuch, and he baptized him. And when they came up out of the water, the Spirit of the Lord carried Philip away, and the eunuch saw him no more, and went on his way rejoicing.',
  'Acts 10:47-48': '"Can anyone withhold water for baptizing these people, who have received the Holy Spirit just as we have?" And he commanded them to be baptized in the name of Jesus Christ. Then they asked him to remain for some days.',
  '1 Corinthians 1:14': 'I thank God that I baptized none of you except Crispus and Gaius,',
  '1 Corinthians 11:23-34': 'For I received from the Lord what I also delivered to you, that the Lord Jesus on the night when he was betrayed took bread, and when he had given thanks, he broke it, and said, "This is my body, which is for you. Do this in remembrance of me." In the same way also he took the cup, after supper, saying, "This cup is the new covenant in my blood. Do this, as often as you drink it, in remembrance of me." For as often as you eat this bread and drink the cup, you proclaim the Lord\'s death until he comes. Whoever, therefore, eats the bread or drinks the cup of the Lord in an unworthy manner will be guilty concerning the body and blood of the Lord. Let a person examine himself, then, and so eat of the bread and drink of the cup. For anyone who eats and drinks without discerning the body eats and drinks judgment on himself. That is why many of you are weak and ill, and some have died. But if we judged ourselves truly, we would not be judged. But when we are judged by the Lord, we are disciplined so that we may not be condemned along with the world. So then, my brothers, when you come together to eat, wait for one another— if anyone is hungry, let him eat at home—so that when you come together it will not be for judgment. About the other things I will give directions when I come.',
  
  // Devoted Youth Verses
  '1 Timothy 4:12': 'Let no one despise you for your youth, but set the believers an example in speech, in conduct, in love, in faith, in purity.',
  '1 Corinthians 10:31': 'So, whether you eat or drink, or whatever you do, do all to the glory of God.',
  'Colossians 3:17': 'And whatever you do, in word or deed, do everything in the name of the Lord Jesus, giving thanks to God the Father through him.',
  'Romans 12:1-2': 'I appeal to you therefore, brothers, by the mercies of God, to present your bodies as a living sacrifice, holy and acceptable to God, which is your spiritual worship. Do not be conformed to this world, but be transformed by the renewal of your mind, that by testing you may discern what is the will of God, what is good and acceptable and perfect.',
  '2 Timothy 2:22': 'So flee youthful passions and pursue righteousness, faith, love, and peace, along with those who call on the Lord from a pure heart.',
  '1 Peter 2:9': 'But you are a chosen race, a royal priesthood, a holy nation, a people for his own possession, that you may proclaim the excellencies of him who called you out of darkness into his marvelous light.',
  'Matthew 5:14-16': 'You are the light of the world. A city set on a hill cannot be hidden. Nor do people light a lamp and put it under a basket, but on a stand, and it gives light to all in the house. In the same way, let your light shine before others, so that they may see your good works and give glory to your Father who is in heaven.'
};

const BibleVersePopup: React.FC<BibleVersePopupProps> = ({ reference, onCloseAction, isOpen }) => {
  const [verseText, setVerseText] = useState('Loading...');
  const [isLoading, setIsLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);

  // Helper function to normalize verse references for lookup
  const normalizeReference = (ref: string): string => {
    // Remove any leading/trailing whitespace
    ref = ref.trim();
    
    // Handle Roman numerals for book names (e.g., I John -> 1 John, II Timothy -> 2 Timothy)
    ref = ref
      .replace(/^I\s+(?=[A-Z])/, '1 ')  // I John -> 1 John
      .replace(/^II\s+(?=[A-Z])/, '2 ')  // II Timothy -> 2 Timothy
      .replace(/^III\s+(?=[A-Z])/, '3 '); // III John -> 3 John
      
    // Handle abbreviated book names (e.g., Jn -> John, Phil -> Philippians)
    const bookAbbreviations: Record<string, string> = {
      'Jas': 'James',
      'Jude': 'Jude',
      'Jn': 'John',
      'Mk': 'Mark',
      'Mt': 'Matthew',
      'Lk': 'Luke',
      'Rom': 'Romans',
      '1 Cor': '1 Corinthians',
      '2 Cor': '2 Corinthians',
      'Gal': 'Galatians',
      'Eph': 'Ephesians',
      'Phil': 'Philippians',
      'Col': 'Colossians',
      '1 Thes': '1 Thessalonians',
      '2 Thes': '2 Thessalonians',
      '1 Tim': '1 Timothy',
      '2 Tim': '2 Timothy',
      'Titus': 'Titus',
      'Phlm': 'Philemon',
      'Heb': 'Hebrews',
      '1 Pet': '1 Peter',
      '2 Pet': '2 Peter',
      '1 Jn': '1 John',
      '2 Jn': '2 John',
      '3 Jn': '3 John',
      'Rev': 'Revelation'
    };
    
    // Check if the reference starts with an abbreviated book name
    const bookMatch = ref.match(/^[1-3]?\s*[A-Za-z]+/);
    if (bookMatch) {
      const possibleAbbr = bookMatch[0].trim();
      if (bookAbbreviations[possibleAbbr]) {
        ref = ref.replace(possibleAbbr, bookAbbreviations[possibleAbbr]);
      }
    }
    
    return ref;
  };

  // Helper function to find the best matching verse reference
  const findBestMatchingVerse = (ref: string): string => {
    // First try exact match
    if (VERSE_TEXTS[ref]) {
      return ref;
    }
    
    // Try to find a matching verse by checking if the reference starts with the same book and chapter
    const normalizedRef = normalizeReference(ref);
    const [bookChapter] = normalizedRef.split(':', 1);
    
    // Find all verse keys that start with the same book and chapter
    const matchingVerses = Object.keys(VERSE_TEXTS).filter(
      key => key.startsWith(bookChapter)
    );
    
    if (matchingVerses.length > 0) {
      // If we have multiple matches, try to find the one that's closest to our reference
      // For now, just return the first match
      return matchingVerses[0];
    }
    
    // If no match found, try to find any verse from the same book
    const bookName = bookChapter.split(' ')[0];
    const bookVerses = Object.keys(VERSE_TEXTS).filter(
      key => key.startsWith(bookName)
    );
    
    return bookVerses[0] || ref; // Return the first verse from the book, or original ref if none found
  };

  useEffect(() => {
    // Set isVisible to true when component mounts to trigger the fade-in animation
    setIsVisible(true);
    setIsLoading(true);

    // Find the best matching verse reference
    const bestMatchRef = findBestMatchingVerse(reference);
    
    // Look up the verse text from our static object
    const text = VERSE_TEXTS[bestMatchRef] || 
                `Verse not found: ${reference}. This verse reference may not be available in our database.`;
    
    setVerseText(text);
    setIsLoading(false);
  }, [reference]);

  const handleClose = useCallback(() => {
    setIsVisible(false);
    setTimeout(onCloseAction, 200);
  }, [onCloseAction]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        onCloseAction();
      }
    };

    // Add event listener when popup is open
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    // Clean up
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onCloseAction]);

  return (
    <div 
      className={`fixed inset-0 bg-black/50 dark:bg-black/80 flex items-center justify-center z-50 p-4 transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      onClick={onCloseAction}
    >
      <div 
        ref={popupRef}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto transition-all duration-200 border border-gray-200 dark:border-gray-700"
        style={{ 
          backgroundColor: 'white', 
          backgroundImage: 'none', 
          backdropFilter: 'none',
          opacity: '1'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 bg-white dark:bg-gray-800">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">{reference}</h3>
            <button 
              onClick={onCloseAction}
              className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none transition-colors"
              aria-label="Close"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="text-gray-800 dark:text-gray-200 mb-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
                <span className="ml-2 dark:text-gray-300">Loading...</span>
              </div>
            ) : (
              <div className="text-gray-800 dark:text-gray-200 max-w-none p-6 rounded-lg bg-white dark:bg-gray-700">
                <p className="whitespace-pre-line">{verseText}</p>
              </div>
            )}
          </div>
          
          <div className="flex justify-end">
            <button
              onClick={onCloseAction}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BibleVersePopup;
