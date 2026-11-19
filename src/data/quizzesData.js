/**
 * HEY GIRL QUIZ CLUB — Çilek Dergisi Kişilik & Kültür Testleri
 * 
 * 1. Hangi Gossip Girl Kızısın?
 * 2. Hangi Dönemin Kızısın?
 * 3. Hayatının Başrol Karakteri Nasıl Biri?
 */

import blairImg from './blair.jpg'
import serenaImg from './serena.jpg'
import jennyImg from './jenny.jpg'
import vanessaImg from './vanessa.jpg'
import lilyImg from './lily.jpg'
import gossipGirlCover from './gossip girl.jpg'

export const QUIZZES = [
  // ── TEST 1: GOSSIP GIRL ──────────────────────────────────────
  {
    id: 'gossip-girl',
    slug: 'gossip-girl',
    title: 'Hangi Gossip Girl Kızısın?',
    subtitle: "Blair'in hırsı mı, Serena'nın enerjisi mi, Jenny'nin cesareti mi? Yoksa bambaşka biri misin?",
    badge: 'POPÜLER TEST · DİZİ & KARAKTER',
    readingTime: '3 dk',
    coverImage: gossipGirlCover,
    accentColor: '#BE2625',
    questionsCount: 9,
    description: "New York sokakları, Met basamakları, gizli sırlar ve asla eskimeyen Upper East Side cazibesi... Blair'in tavizsiz hırsı mı, Serena'nın çabasız ışıltısı mı, Jenny'nin asi yeteneği mi, Vanessa'nın bağımsız sanatsal ruhu mu yoksa Lily'nin asil gücü mü? Hadi hangi Gossip Girl kızı olduğunu keşfedelim!",
    results: {
      blair: {
        id: 'blair',
        name: 'Blair Waldorf',
        role: "Upper East Side'ın Hükümdarı",
        tagline: 'Kraliçe Arı & Strateji Dehası',
        quote: '“İstediklerimi şansa bırakmam, onları elde ederim.”',
        image: blairImg,
        color: '#8A1C2C',
        traits: ['Lider', 'Stratejik', 'Sadık', 'Kusursuz Tarz', 'Klasik Zarafet'],
        description: 'Sen tam anlamıyla bir vizyon ve irade abidesisin! Hayatında hiçbir şeyi tesadüflere bırakmazsın; bir planın her zaman A, B ve Z planı hazırdır. İkonik taçların ve inci kolyelerin arkasında sevdiklerine son derece sadık, kırılgan ama çelik gibi güçlü bir kalp saklı. Hedeflerine ulaşırken zarafetinden ve yüksek standartlarından asla ödün vermezsin.',
        aesthetic: 'İnci kolyeler, Audrey Hepburn ilhamı, saten taçlar, Met Müzesi basamakları ve makaron kutuları.'
      },
      serena: {
        id: 'serena',
        name: 'Serena van der Woodsen',
        role: 'Zahmetsizce Büyüleyen Işıltı',
        tagline: 'Manyetik Karizma & Özgür Ruh',
        quote: '“Güneş parıldarken hayatı kutlamamak elde mi?”',
        image: serenaImg,
        color: '#D49B55',
        traits: ['Manyetik', 'Sıcakkanlı', 'Çabasız Şık', 'Özgür Ruh', 'Affedici'],
        description: 'Sen odaya girdiğin anda odadaki bütün ışıklar sana döner, hem de sen bunun için parmağını bile kıpırdatmadan! Doğal bir auran, insanları anında saran sıcacık bir enerjin var. Geçmişe takılı kalmaz, daima kalbinin sesini dinlersin. Hata yapmaktan korkmaz, hayatı bir macera gibi yaşamayı seversin. Çabasız şıklığın ve neşen senin süper gücün.',
        aesthetic: 'Rüzgarda uçuşan dalgalı sarı saçlar, bohem elbiseler, altın ışıltılar ve sabah espresso kokusu.'
      },
      jenny: {
        id: 'jenny',
        name: 'Jenny Humphrey',
        role: 'Cesur & Sınırları Aşan Yaratıcı',
        tagline: 'Gözü Pek Tasarımcı & İsyankar Kalp',
        quote: '“Kuralları onlar koyduysa, ben de kendi sahnemi yaratırım.”',
        image: jennyImg,
        color: '#2B2B2B',
        traits: ['Yaratıcı', 'Cesur', 'Özgün', 'Azimli', 'Yenilikçi'],
        description: 'Sen kalıplara sığmayan, kendi yolunu sıfırdan çizen gerçek bir yaratıcısın! Bir dikiş makinesi ve cesaretle dünyayı değiştirebilecek vizyona sahipsin. Başkalarının koyduğu sınırları sorgular, kendi özgün stilini gururla taşırsın. Düştüğün zaman daha da güçlü ayağa kalkar, her yenilgiyi ilhama dönüştürürsün.',
        aesthetic: 'Deri ceketler, dumanlı göz makyajı, vintage dikiş kumaşları ve Brooklyn sokak sanatı.'
      },
      vanessa: {
        id: 'vanessa',
        name: 'Vanessa Abrams',
        role: 'Özgün & Bağımsız Entelektüel',
        tagline: 'Sanatçı Gözü & Derin Düşünceler',
        quote: '“Popüler olmak değil, sahici kalmak önemli.”',
        image: vanessaImg,
        color: '#4B6B58',
        traits: ['Entelektüel', 'Sahici', 'Gözlemci', 'Sanatsever', 'Bağımsız'],
        description: 'Sen gösterişten uzak, derinliği ve anlamı arayan bağımsız bir ruha sahipsin. Popüler olanın peşinden koşmaz; kendi doğrularının, sanatının ve değerlerinin arkasında dimdik durursun. Eski bir plakçı, bağımsız bir film gösterimi veya sabaha kadar süren edebiyat sohbetleri senin evindir.',
        aesthetic: 'Analog fotoğraf makineleri, salaş trikolar, indie plaklar ve yerel kahve dükkanları.'
      },
      lily: {
        id: 'lily',
        name: 'Lily van der Woodsen',
        role: 'Zarafetin ve Gücün Sembolü',
        tagline: 'Sessiz Lüks & Sarsılmaz Asalet',
        quote: '“Her fırtınanın ortasında bile duruşunu korumalısın.”',
        image: lilyImg,
        color: '#6E4D5A',
        traits: ['Asil', 'Korumacı', 'Sakin Güç', 'Zevk Sahibi', 'Vizyoner'],
        description: 'Sen fırtınaların ortasında bile zarafetini kaybetmeyen, sessiz bir gücün temsilcisisin. Geçmişinde belki biraz rock’n roll gizlidir ama bugün girdiğin her ortamda asil duruşunla saygı uyandırırsın. Sevdiklerini korumak için elinden geleni yapar, kriz anlarını inanılmaz bir soğukkanlılıkla çözersin.',
        aesthetic: 'Klasik kaşmir takımlar, çağdaş sanat galerileri, kristal kadehler ve penthouse şıklığı.'
      }
    },
    questions: [
      {
        id: 1,
        question: 'Cumartesi sabahı için senin hayalindeki ideal uyanış senaryosu hangisi?',
        options: [
          { text: 'Kusursuz ipek pijamalarla uyanıp, günün stratejik yapılacaklar listesini gözden geçirmek.', scores: { blair: 3, lily: 1 } },
          { text: 'Sabah kahvemi alıp Central Park’ta güneşin ve müziğin tadını çıkarmak.', scores: { serena: 3, vanessa: 1 } },
          { text: 'Gece boyu süren yaratıcı çizimlerin ardından kahve eşliğinde yeni bir tasarıma başlamak.', scores: { jenny: 3 } },
          { text: 'Yerel bir kafede ikinci el kitapları karıştırıp analog kameramla fotoğraf çekmek.', scores: { vanessa: 3 } },
          { text: 'Günün gazetesini okurken şık porselenden yasemin çayımı yudumlamak ve ajandamı düzenlemek.', scores: { lily: 3, blair: 1 } }
        ]
      },
      {
        id: 2,
        question: 'Gardırobunun olmazsa olmaz imza parçası hangisi?',
        options: [
          { text: 'Kişiye özel dikim blazer ceket ve inci işlemeli zarif bir taç.', scores: { blair: 3 } },
          { text: 'Sırt dekolteli dökümlü bir elbise ve gösterişli altın takılar.', scores: { serena: 3 } },
          { text: 'Kendi zımbaladığım oversized deri ceket ve iddialı platform botlar.', scores: { jenny: 3 } },
          { text: 'Vintage bir hırka, etnik desenli fular ve kumaş tote bag çanta.', scores: { vanessa: 3 } },
          { text: 'Kusursuz kesim bej kaşmir kaban ve zamansız bir Hermès çanta.', scores: { lily: 3 } }
        ]
      },
      {
        id: 3,
        question: 'Çok yakın bir arkadaşın sana haksızlık yaptığında tepkin ne olur?',
        options: [
          { text: 'Hemen intikam planı yapmam; beklerim, doğru an geldiğinde dersini en şık şekilde veririm.', scores: { blair: 3 } },
          { text: 'Önce çok üzülürüm, mesafemi koyarım ama kalbimde kin tutamam, yüzleşip çözerim.', scores: { serena: 3 } },
          { text: 'Kapıyı sertçe çarpar, enerjimi kendi başarımı ve yeni projelerimi büyütmeye harcarım.', scores: { jenny: 3 } },
          { text: 'Yüzüne açık ve dürüstçe söylerim; yüzeysel oyunlara hiç gelemem.', scores: { vanessa: 3 } },
          { text: 'Sakinliğimi korurum, ailemi ve saygınlığımı koruyacak diplomatik bir sınır çizerim.', scores: { lily: 3 } }
        ]
      },
      {
        id: 4,
        question: 'Büyük bir Upper East Side partisinde seni nerede buluruz?',
        options: [
          { text: 'En seçkin konuklarla çevrili, gecenin gidişatını sessizce yönettiğim masada.', scores: { blair: 3 } },
          { text: 'Dans pistinin tam ortasında, herkesle sohbet edip kahkahalar atarken.', scores: { serena: 3 } },
          { text: 'Partiye biraz geç gelip kıyafetimle bütün gözleri üzerime çekerken.', scores: { jenny: 3 } },
          { text: 'Partinin samimiyetsizliğini arkadaşımla balkondan izleyip felsefe yaparken.', scores: { vanessa: 3 } },
          { text: 'Gecenin ev sahibi olarak konukları zarafetle selamlarken.', scores: { lily: 3 } }
        ]
      },
      {
        id: 5,
        question: 'Favori kafe siparişin nedir?',
        options: [
          { text: 'Yağsız sütlü vanilyalı latte ve yanında bir taze ahududulu makaron.', scores: { blair: 3 } },
          { text: 'Buzlu karamelli macchiato — tatlı, ferah ve enerjik.', scores: { serena: 3 } },
          { text: 'Duble sert espresso — hızlı, yoğun ve işime odaklanmamı sağlayan.', scores: { jenny: 3 } },
          { text: 'Organik yulaf sütlü filtre kahve veya zencefilli bitki çayı.', scores: { vanessa: 3 } },
          { text: 'Porselen fincanda taze demlenmiş Earl Grey veya bir kadeh soğuk şampanya.', scores: { lily: 3 } }
        ]
      },
      {
        id: 6,
        question: 'Hayattaki en büyük itici gücün nedir?',
        options: [
          { text: 'Hak ettiğim zirveye ulaşmak ve asla ikinci sırada kalmamak.', scores: { blair: 3 } },
          { text: 'Sevildiğimi hissetmek, yeni insanlarla bağ kurmak ve anı yaşamak.', scores: { serena: 3 } },
          { text: 'Kendi emeğimle bir marka olmak ve bağımsızlığımı kanıtlamak.', scores: { jenny: 3 } },
          { text: 'Kendime ve değerlerime sadık kalarak anlamlı bir iz bırakmak.', scores: { vanessa: 3 } },
          { text: 'Kurduğum düzeni, sevdiklerimi ve huzurumu her şartta korumak.', scores: { lily: 3 } }
        ]
      },
      {
        id: 7,
        question: 'Hangi tatil kaçamağı tam senin ruhuna göre?',
        options: [
          { text: 'Paris’te lüks butik otel, Louvre turları ve haute couture alışveriş.', scores: { blair: 3 } },
          { text: 'St. Tropez’de güneşlenmek, tekne turları ve gece plaj partileri.', scores: { serena: 3 } },
          { text: 'Londra’da punk-rock vintage pazarları ve gizli tasarım atölyeleri.', scores: { jenny: 3 } },
          { text: 'İzlanda veya Vermont’ta doğa yürüyüşü, ahşap kulübe ve sessizlik.', scores: { vanessa: 3 } },
          { text: 'Hamptons’taki sakin malikanede özel davetler ve dinlenme.', scores: { lily: 3 } }
        ]
      },
      {
        id: 8,
        question: 'Aşkta senin kırmızı çizgin nedir?',
        options: [
          { text: 'Sadakatsizlik ve benim hırsıma ayak uyduramayacak kadar zayıf olması.', scores: { blair: 3 } },
          { text: 'Beni kısıtlamaya çalışması veya bana dürüst olmaması.', scores: { serena: 3 } },
          { text: 'Hayallerimi küçümsemesi ve yeteneğimi görmezden gelmesi.', scores: { jenny: 3 } },
          { text: 'Yüzeysel olması ve sadece dış görünüşe ya da paraya önem vermesi.', scores: { vanessa: 3 } },
          { text: 'Aileme ve sosyal konumuma saygısızlık etmesi.', scores: { lily: 3 } }
        ]
      },
      {
        id: 9,
        question: 'Çantandan asla eksik etmediğin küçük lüksün nedir?',
        options: [
          { text: 'Kırmızı ruj, küçük cep aynası ve monogramlı ajandam.', scores: { blair: 3 } },
          { text: 'Parlatıcı lipgloss ve güneş gözlüğüm.', scores: { serena: 3 } },
          { text: 'Eskiz defterim, siyah pilot kalemim ve kulaklığım.', scores: { jenny: 3 } },
          { text: 'O an okuduğum kitap ve analog kameram.', scores: { vanessa: 3 } },
          { text: 'İmza parfümüm ve altın kartlığım.', scores: { lily: 3 } }
        ]
      }
    ]
  },

  // ── TEST 2: HANGİ DÖNEMİN KIZISIN? ──────────────────────────
  {
    id: 'hangi-donemin-kizisin',
    slug: 'hangi-donemin-kizisin',
    title: 'Hangi Dönemin Kızısın?',
    subtitle: "90'lar, Y2K, coquette veya old money... Sen hangi döneme aitsin?",
    badge: 'ESTETİK & TARZ TESTİ',
    readingTime: '3 dk',
    coverImage: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1000&q=80',
    accentColor: '#6B9B7C',
    questionsCount: 9,
    description: "Slip elbiselerden fiyonklara, vintage kasetlerden ışıltılı lipglosslara kadar her dönemin bambaşka bir ruhu var. Senin kalbin hangi dönemin melodisiyle atıyor? Gerçek stil kimliğini ve estetik dönemini keşfetme zamanı!",
    results: {
      '90s': {
        id: '90s',
        name: "90'lar Minimalizmi",
        role: 'Zahmetsiz Havalı & Sahici',
        tagline: 'Siyah Beyaz Nostalji & Slip Elbiseler',
        quote: '“Sadelik, en yüksek zarafettir.”',
        image: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1000&q=80',
        color: '#3D2730',
        traits: ['Cool', 'Minimalist', 'Zamansız', 'Sahici', 'Nostaljik'],
        description: 'Sen sadeliğin gücüne inanan gerçek bir 90’lar ruhusun! Dökümlü slip elbiseler, vintage deri ceketler, fırçasız doğal saçlar ve kahve tonlarında dudaklar tam senin tarzın. Gösterişli süslemeler yerine duru bir estetiği tercih edersin. Az konuşur, tarzınla çok şey söylersin.',
        aesthetic: 'Analog fotoğraf kareleri, siyah beyaz filmler, deri trençkotlar ve sade kahveler.'
      },
      y2k: {
        id: 'y2k',
        name: 'Y2K İkonu',
        role: 'Işıltılı, Cesur ve Eğlenceli',
        tagline: 'Pembe Lipglosslar & Fütüristik Nostalji',
        quote: '“Daha fazla sim, daha fazla pembe ve sınırsız pop enerjisi!”',
        image: 'https://images.unsplash.com/photo-1516762689617-e1cffcef479d?auto=format&fit=crop&w=1000&q=80',
        color: '#E05A8D',
        traits: ['Enerjik', 'Işıltılı', 'Cesur', 'Trend Öncüsü', 'Eğlenceli'],
        description: 'Sen milenyumun ilk yıllarındaki o taptaze, parlak ve kaygısız enerjisin! Düşük bel kumaşlar, parıltılı kelebek tokalar, pembe lipgloss ve kapaklı telefon estetiği senin imzan. Hayatı çok ciddiye alıp neşeni kaybetmezsin; girdiğin her ortama eğlence ve ışıltı getirirsin.',
        aesthetic: 'Simli dokular, pembe tonlar, mini etekler, 2000’ler pop hitleri ve ayna selfieleri.'
      },
      coquette: {
        id: 'coquette',
        name: 'Coquette & Fransız Romantizmi',
        role: 'Naif, Zarif ve Şiirsel',
        tagline: 'İpek Kurdeleler & Çilekli Düşler',
        quote: '“Hayat, vintage bir aşk romanı gibi incelikle yaşanmalı.”',
        image: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=1000&q=80',
        color: '#D87A8C',
        traits: ['Romantik', 'Zarif', 'Duygusal', 'Masalsı', 'İncelikli'],
        description: 'Sen dünyaya pembe bir tülün arkasından bakan, fiyonkları ve dantelleri kalbinde taşıyan bir coquette ruhsun! Çilekli tatlılar, el yazısı mektuplar, klasik bale zarafeti ve melankolik aşk şarkıları seni anlatır. Kırılgan görünüşünün altında hislerine sadık çok güçlü bir iç dünya vardır.',
        aesthetic: 'Saten fiyonklar, porselen fincanlar, dantelli çoraplar, çilekler ve Lana Del Rey şarkıları.'
      },
      oldmoney: {
        id: 'oldmoney',
        name: 'Old Money Estetiği',
        role: 'Sessiz Lüksün Temsilcisi',
        tagline: 'Nesilden Nesile Aktarılan Asalet',
        quote: '“Gerçek zenginlik bağırmaz, fısıldar.”',
        image: 'https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?auto=format&fit=crop&w=1000&q=80',
        color: '#284638',
        traits: ['Asil', 'Seçkin', 'Disiplinli', 'Kaliteli', 'Zevk Sahibi'],
        description: 'Sen trendlerin ötesinde, zamana meydan okuyan bir asaletsin! Kaşmir kazaklar, tenis kortları, klasik inci küpeler ve ata sporu zarafeti senin doğanda var. Logoların arkasına saklanmaz, kumaşın dokusundan ve dikimin kalitesinden anlarsın. Nezaketin ve duruşunla her zaman bir adım öndesin.',
        aesthetic: 'Beyaz keten gömlekler, tenis etekleri, ahşap kütüphaneler ve vintage cabrio arabalar.'
      },
      cleangirl: {
        id: 'cleangirl',
        name: 'Clean Girl & Modern Sadelik',
        role: 'Taze, Dengeli ve Işıltılı',
        tagline: 'Sabah Matchası & İç Huzur',
        quote: '“İç huzur, nemli bir cilt ve berrak bir zihin.”',
        image: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=1000&q=80',
        color: '#7EA28C',
        traits: ['Dengeli', 'Organik', 'Taze', 'Minimalist', 'Düzenli'],
        description: 'Sen modern çağın en ferah nefesisin! Parlak ve taze bir cilt, taranmış kaşlar, altın halka küpeler, buzlu matcha ve sabah yürüyüşleri senin ritmini oluşturur. Hayatındaki fazlalıklardan arınmışsın. Hem zihnini hem bedenini besleyen bir denge içinde parıldıyorsun.',
        aesthetic: 'Nötr bej tonlar, cam su şişeleri, pilates matı, nemli cilt ışıltısı ve altın halka küpeler.'
      },
      indiesleaze: {
        id: 'indiesleaze',
        name: 'Indie Sleaze / Gece Kuşu',
        role: 'Filtresiz, Asi ve Spontane',
        tagline: 'Flaşlı Fotoğraflar & Rock’n Roll',
        quote: '“Müzik yüksek, ışıklar loş ve anı yaşamak tek kural.”',
        image: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=1000&q=80',
        color: '#5A4A78',
        traits: ['Özgür', 'Filtresiz', 'Spontane', 'Asi', 'Gece İnsanı'],
        description: 'Sen hiçbir şeyin kusursuz olmasını istemeyen, kaosun içindeki gerçekliği seven bir gece kuşusun! Flaşlı dijital kameralar, hafif dağılmış göz kalemi, vintage grup tişörtleri ve sabaha karşı dinlenen gitar riffleri tam senin havan. Filtrelere ve sahte mükemmelliklere karnın tok; sen hayatı olduğu gibi seviyorsun.',
        aesthetic: 'Dağınık saçlar, polaroid flaşları, vinil plaklar, yırtık külotlu çoraplar ve gece yürüyüşleri.'
      }
    },
    questions: [
      {
        id: 1,
        question: 'Güne başlarken ilk tercih edeceğin içecek hangisi olur?',
        options: [
          { text: 'Sade filtre kahve ya da buzlu Americano — temiz, şekersiz ve net.', scores: { '90s': 3 } },
          { text: 'Pembe renkli çilekli frappuccino veya karamelli buzlu latte.', scores: { y2k: 3 } },
          { text: 'Gül yapraklı bitki çayı veya porselen fincanda sıcak sütlü vanilya.', scores: { coquette: 3 } },
          { text: 'Taze sıkılmış portakal suyu ve yanında sıcak demlenmiş İngiliz çayı.', scores: { oldmoney: 3 } },
          { text: 'Buzlu yulaf sütlü yeşil matcha latte veya taze detoks suyu.', scores: { cleangirl: 3 } },
          { text: 'Karton bardakta duble koyu espresso — gece uzun geçmiş belli ki!', scores: { indiesleaze: 3 } }
        ]
      },
      {
        id: 2,
        question: 'Hayalindeki oda dekorasyonu nasıl görünür?',
        options: [
          { text: 'Ahşap zemin, beyaz duvarlar, tek bir vintage deri koltuk ve siyah-beyaz çerçeveler.', scores: { '90s': 3 } },
          { text: 'Pembe tüller, peri ışıkları, ayna önü parlatıcı koleksiyonu ve peluş detaylar.', scores: { y2k: 3 } },
          { text: 'Dantel yatak örtüsü, kurdeleler, kuru güller ve antika parfüm şişeleri.', scores: { coquette: 3 } },
          { text: 'Koyu ahşap kütüphane, yeşil kadife berjer, altın şamdanlar ve klasik tablolar.', scores: { oldmoney: 3 } },
          { text: 'Beyaz keten nevresimler, doğal gün ışığı, okaliptüs vazosu ve minimal kokulu mumlar.', scores: { cleangirl: 3 } },
          { text: 'Duvara bantlanmış konser afişleri, vinil plaklar ve yerde duran bir gitar amfisi.', scores: { indiesleaze: 3 } }
        ]
      },
      {
        id: 3,
        question: 'Çıkış için hazırlandığında makyaj stilin ne olur?',
        options: [
          { text: 'Kahve tonlarında dudak kalemi, mat bir ten ve maskarasız doğal kirpikler.', scores: { '90s': 3 } },
          { text: 'Bol parıltılı lipgloss, açık mavi veya lila göz farı ve ışıltılı allık.', scores: { y2k: 3 } },
          { text: 'Kedi gözü ince eyeliner, pembe yanaklar ve dudağın ortasına hafifçe dağıtılmış vişne tonu.', scores: { coquette: 3 } },
          { text: '“Yok gibi” bir ten makyajı, hafif şeftali krem allık ve bakımlı kaşlar.', scores: { oldmoney: 3 } },
          { text: 'Işıltılı nemli bir cilt, taranmış şeffaf kaş jeli ve dudak bakım yağı.', scores: { cleangirl: 3 } },
          { text: 'Hafifçe dağılmış koyu siyah göz kalemi, asi ve çabasız.', scores: { indiesleaze: 3 } }
        ]
      },
      {
        id: 4,
        question: 'Fotoğraf albümünde en çok hangi tarz kareler yer alır?',
        options: [
          { text: 'Grenli 35mm film kareleri, filtresiz ve zamansız portreler.', scores: { '90s': 3 } },
          { text: 'Dijital kompakt kameranın flaşıyla çekilmiş eğlenceli parti pozları.', scores: { y2k: 3 } },
          { text: 'Çiçekler, dantel detayları, çilekli tatlılar ve gün batımı gökyüzü.', scores: { coquette: 3 } },
          { text: 'Tenis kortu, yeşil bahçeler, zarif aile sofraları ve mimari detaylar.', scores: { oldmoney: 3 } },
          { text: 'Pilates sonrası ayna yansıması, sağlıklı kahvaltı kasesi ve güneş ışığı oyunları.', scores: { cleangirl: 3 } },
          { text: 'Bulanık gece fotoğrafları, konser sahneleri ve loş sokak köşeleri.', scores: { indiesleaze: 3 } }
        ]
      },
      {
        id: 5,
        question: 'Bir pazar günü film izlemek istesen hangisini açarsın?',
        options: [
          { text: 'Clueless ya da Before Sunrise — 90’ların sahici diyalogları.', scores: { '90s': 3 } },
          { text: 'Mean Girls ya da Legally Blonde — eğlenceli ve ikonik.', scores: { y2k: 3 } },
          { text: 'Marie Antoinette ya da Pride and Prejudice — görsel bir ziyafet.', scores: { coquette: 3 } },
          { text: 'The Talented Mr. Ripley ya da Dead Poets Society — asil ve klasik.', scores: { oldmoney: 3 } },
          { text: 'Sakin bir doğa belgeseli ya da ilham veren bir İskandinav mimari turu.', scores: { cleangirl: 3 } },
          { text: 'Almost Famous ya da Trainspotting — ham, cesur ve müzik dolu.', scores: { indiesleaze: 3 } }
        ]
      },
      {
        id: 6,
        question: 'Seni en iyi tanımlayan aksesuar hangisi?',
        options: [
          { text: 'Küçük oval çerçeveli retro güneş gözlüğü ve siyah kemer.', scores: { '90s': 3 } },
          { text: 'Renkli boncuklu telefon askısı ve simli minik saç tokaları.', scores: { y2k: 3 } },
          { text: 'Saça takılan ipek beyaz bir kurdele veya inci gerdanlık.', scores: { coquette: 3 } },
          { text: 'Aile yadigarı klasik bir kol saati ve altın küçük halka küpe.', scores: { oldmoney: 3 } },
          { text: 'Minimalist altın zincir kolye ve cam kahve termosu.', scores: { cleangirl: 3 } },
          { text: 'Gümüş yüzükler ve omza asılmış vintage kanvas postacı çantası.', scores: { indiesleaze: 3 } }
        ]
      },
      {
        id: 7,
        question: 'Müzik listende en çok hangi sesler çalar?',
        options: [
          { text: 'Fiona Apple, Nirvana, Mazzy Star — saf melodi ve duygu.', scores: { '90s': 3 } },
          { text: 'Britney Spears, Destiny’s Child, Gwen Stefani — dans ve pop.', scores: { y2k: 3 } },
          { text: 'Lana Del Rey, klasik piyano besteleri ve romantik Fransız şansonları.', scores: { coquette: 3 } },
          { text: 'Vivaldi, klasik caz melodileri ya da Frank Sinatra.', scores: { oldmoney: 3 } },
          { text: 'Akustik sakin melodiler, ambient sesler ve taze lo-fi ritimler.', scores: { cleangirl: 3 } },
          { text: 'The Strokes, Arctic Monkeys, Yeah Yeah Yeahs — çiğ gitar sesleri.', scores: { indiesleaze: 3 } }
        ]
      },
      {
        id: 8,
        question: 'Bir hafta sonu kaçamağı için bavulunu nereye açmak istersin?',
        options: [
          { text: 'Seattle veya Berlin’de yağmurlu bir sokakta kahve içmek.', scores: { '90s': 3 } },
          { text: 'Miami ya da Los Angeles’ta palmiyeler altında paten kaymak.', scores: { y2k: 3 } },
          { text: 'Fransız kırsalında şatolar arasında çiçek toplamak.', scores: { coquette: 3 } },
          { text: 'Como Gölü kıyısında ya da İsviçre Alpleri’nde bir otelde dinlenmek.', scores: { oldmoney: 3 } },
          { text: 'Kopenhag’da bisiklete binip fırınlardan taze ekmek almak.', scores: { cleangirl: 3 } },
          { text: 'Londra’nın Camden pazarında kaybolup gece yeraltı kulüplerine akmak.', scores: { indiesleaze: 3 } }
        ]
      },
      {
        id: 9,
        question: 'Hayat felsefeni tek bir kelimeyle özetlesen hangisi olurdu?',
        options: [
          { text: 'Sahicilik.', scores: { '90s': 3 } },
          { text: 'Işıltı.', scores: { y2k: 3 } },
          { text: 'Zarafet.', scores: { coquette: 3 } },
          { text: 'Asalet.', scores: { oldmoney: 3 } },
          { text: 'Denge.', scores: { cleangirl: 3 } },
          { text: 'Özgürlük.', scores: { indiesleaze: 3 } }
        ]
      }
    ]
  },

  // ── TEST 3: HAYATININ BAŞROL KARAKTERİ NASIL BİRİ? ──────────
  {
    id: 'hayatinin-basrol-karakteri',
    slug: 'hayatinin-basrol-karakteri',
    title: 'Hayatının Başrol Karakteri Nasıl Biri?',
    subtitle: 'Romantik bir hayalperest misin, hırslı bir kariyer kızı mı, yoksa kendi dünyasında yaşayan gizemli biri mi?',
    badge: 'KİŞİLİK & ARKETİP TESTİ',
    readingTime: '3 dk',
    coverImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=1000&q=80',
    accentColor: '#E8B54D',
    questionsCount: 9,
    description: 'Eğer hayatın ödüllü bir sinema filmi olsaydı, senin karakterin seyirciyi nasıl büyülerdi? Kalbinin rehberliğinde yürüyen bir hayalperest mi, zirveye odaklanmış güçlü bir lider mi, yoksa rüzgarı arkasına almış özgür bir gezgin mi? İçindeki başrolü ortaya çıkarma zamanı!',
    results: {
      romantic: {
        id: 'romantic',
        name: 'Romantik Hayalperest',
        role: 'Kendi Şiirini Yaşayan Ruh',
        tagline: 'Kalbinin Sesini Dinleyen Bir Sinema Karakteri',
        quote: '“Dünya ne kadar hızlanırsa hızlansın, ben kalbimin ritminde yürürüm.”',
        image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1000&q=80',
        color: '#D4738C',
        traits: ['Duygusal', 'Şefkatli', 'Şair Ruhlu', 'Sezgisel', 'İlham Veren'],
        description: 'Senin filmin, sonbahar yapraklarının savrulduğu melankolik ama sıcacık bir Fransız filmine benziyor. Hayattaki en büyük gücün derin hissetme yeteneğin. Başkalarının aceleyle geçtiği küçük anlarda bir mucize bulursun. Aşk, dostluk ve incelik senin dünyanı yönetir; çevrene koşulsuz bir sevgi ve ışık yayarsın.',
        aesthetic: 'Yağmur kokusu, sararmış mektup sayfaları, sıcak latte fincanları ve içten gülümsemeler.'
      },
      ambitious: {
        id: 'ambitious',
        name: 'Hırslı Kariyer Kızı',
        role: 'Zirveyi Adım Adım İnşa Eden',
        tagline: 'Kararlı, Şık ve Durdurulamaz',
        quote: '“Gelecek beklenmez; azimle, şıklıkla ve emekle inşa edilir.”',
        image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=1000&q=80',
        color: '#8A1C2C',
        traits: ['Kararlı', 'Lider', 'Disiplinli', 'Vizyoner', 'Kendinden Emin'],
        description: 'Senin filmin, New York silüetinin önünde hızlı adımlarla yürüyen ilham verici bir başarı hikayesi! Ne istediğini çok iyi biliyorsun ve oraya nasıl gideceğinin haritası aklında hazır. Engeller seni korkutmaz; aksine azmini kamçılar. Hem zekanın hem de stilinin gücüyle girdiğin her kapıyı aralarsın.',
        aesthetic: 'Kusursuz blazer takımlar, şehir ışıkları, espresso shot’ları ve hedeflerle dolu ajandalar.'
      },
      free_spirit: {
        id: 'free_spirit',
        name: 'Özgür Ruh & Gezgin',
        role: 'Kalıplara Sığmayan Maceracı',
        tagline: 'Spontane, Bağımsız ve Sonsuz Meraklı',
        quote: '“Rüzgar nereye eserse değil, merakım nereye çekerse oraya!”',
        image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1000&q=80',
        color: '#6B9B7C',
        traits: ['Özgür', 'Spontane', 'Cesur', 'Maceracı', 'Filtresiz'],
        description: 'Senin filmin, açık pencereli bir arabayla gün batımına doğru sürülen harika bir yol hikayesi! Rutinler ve kurallar sana göre değil. Bir sırt çantasıyla yeni şehirlere gitmek, tanımadığın insanlarla kahkaha paylaşmak ve bilinmeyene adım atmak senin yaşam iksirin. Ruhun hiçbir kafese sığmaz.',
        aesthetic: 'Rüzgarda savrulan saçlar, gün batımı gökyüzü, yol şarkıları ve pasaport damgaları.'
      },
      mysterious: {
        id: 'mysterious',
        name: 'Gizemli ve Gözlemci',
        role: 'Derin Suların Sakin Gücü',
        tagline: 'Az Konuşan, Çok Şey Bilen Büyüleyici Aura',
        quote: '“Az konuşup çok görmek, dünyanın en büyük zarafetidir.”',
        image: 'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=1000&q=80',
        color: '#3D2730',
        traits: ['Gizemli', 'Gözlemci', 'Zeki', 'Seçici', 'Karizmatik'],
        description: 'Senin filmin, loş ışıklar altında geçen büyüleyici bir neo-noir sinema başyapıtı. Kalabalıkların ortasında bile kendine has sessiz bir auran vardır. İnsanlar senin ne düşündüğünü merak eder çünkü sen her kelimeni özenle seçersin. Sezgilerin bir dedektif kadar keskin, iç dünyan ise dipsiz bir kütüphane kadar zengin.',
        aesthetic: 'Koyu renk trençkotlar, köşe masalar, siyah kahve, mimari gölgeler ve derin bakışlar.'
      },
      adventurer: {
        id: 'adventurer',
        name: 'Maceracı & Tutkulu Hikaye Avcısı',
        role: 'Hayatı Dolu Dolu Yaşayan Cesur Kalp',
        tagline: 'Korkusuzca Deneyen & Unutulmaz Kılan',
        quote: '“Sonunda hatırlayacağımız tek şey, aldığımız cesur kararlar olacak.”',
        image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1000&q=80',
        color: '#E8B54D',
        traits: ['Cesur', 'Tutkulu', 'Enerjik', 'İnisiyatif Alan', 'Unutulmaz'],
        description: 'Senin filmin, temposu bir saniye bile düşmeyen heyecan dolu bir macera! Konfor alanında oturup beklemek sana göre değil; hayatı doğrudan yakasından tutup yaşamayı seversin. Başkalarının “yapamazsın” dediği şeyleri bir meydan okuma olarak görür, her maceradan paha biçilmez bir hikaye çıkarırsın.',
        aesthetic: 'Analog kameralar, dağ manzaraları, kamp ateşleri, plansız biletler ve kahkahalar.'
      }
    },
    questions: [
      {
        id: 1,
        question: 'Hayatında önemli bir karar alırken son sözü kim söyler?',
        options: [
          { text: 'Kalbimin derinliklerinden gelen sezgiler ve hissettiklerim.', scores: { romantic: 3 } },
          { text: 'Mantığım, hedeflerime olan katkısı ve stratejik hesaplarım.', scores: { ambitious: 3 } },
          { text: 'Anlık içgüdüm — beni en çok heyecanlandıran ve özgür kılan yol.', scores: { free_spirit: 3 } },
          { text: 'Detaylı gözlemlerim ve kimseyle paylaşmadığım analizlerim.', scores: { mysterious: 3 } },
          { text: 'Cesaretim — en çok korkutan ama en büyük macerayı vadeden seçenek!', scores: { adventurer: 3 } }
        ]
      },
      {
        id: 2,
        question: 'Seni en çok heyecanlandıran pazar günü senaryosu hangisi?',
        options: [
          { text: 'Yağmur yağarken sıcak bir kahve ve en sevdiğim şiir kitabıyla battaniye altında kaybolmak.', scores: { romantic: 3 } },
          { text: 'Önümüzdeki ayın projelerini planlamak, yeni beceriler öğrenmek ve haftaya hazır hissetmek.', scores: { ambitious: 3 } },
          { text: 'Hiç bilmediğim bir rotaya plansızca yürümek, sokak sokak şehri keşfetmek.', scores: { free_spirit: 3 } },
          { text: 'Sessiz bir kütüphanede veya kimsenin bilmediği gizli bir kafede insanları gözlemlemek.', scores: { mysterious: 3 } },
          { text: 'Arkadaşları toplayıp doğada kamp yapmak ya da yeni bir sporu ilk kez denemek.', scores: { adventurer: 3 } }
        ]
      },
      {
        id: 3,
        question: 'Senin hayatını anlatan filmin müzik türü ne olurdu?',
        options: [
          { text: 'Melankolik piyanolar, yaylı çalgılar ve kalbe dokunan Fransız melodileri.', scores: { romantic: 3 } },
          { text: 'Modern, dinamik, ritmik ve motive eden güçlü elektronik-pop vuruşları.', scores: { ambitious: 3 } },
          { text: 'Akustik folk melodileri, rüzgar sesleri ve bohem gitar tınıları.', scores: { free_spirit: 3 } },
          { text: 'Derin synth sesleri, lo-fi tınılar ve gizemli sinematik arka planlar.', scores: { mysterious: 3 } },
          { text: 'Coşkulu rock tınıları, hızlı davullar ve enerji patlamaları.', scores: { adventurer: 3 } }
        ]
      },
      {
        id: 4,
        question: 'Bir arkadaş grubunda kriz çıktığında sen ne yaparsın?',
        options: [
          { text: 'Herkesi sarıp sarmalar, kırılan kalpleri onarmak için arabulucu olurum.', scores: { romantic: 3 } },
          { text: 'Hemen durumu kontrol altına alır, mantıklı çözüm adımlarını net şekilde sıralarım.', scores: { ambitious: 3 } },
          { text: 'Dramadan uzak dururum; hayatın negatiflikle boğuşmak için çok kısa olduğunu hatırlarım.', scores: { free_spirit: 3 } },
          { text: 'Sessizce herkesi izler, sorunun kök nedenini tek bir isabetli cümleyle ortaya koyarım.', scores: { mysterious: 3 } },
          { text: 'Ortamı dağıtacak cesur bir espri yapar veya grubu dışarı çıkarıp havayı değiştiririm.', scores: { adventurer: 3 } }
        ]
      },
      {
        id: 5,
        question: 'Aşağıdaki sözlerden hangisi senin ruhunun manifestosu olabilir?',
        options: [
          { text: '“Sevgiyle bakılan her şey güzeldir.”', scores: { romantic: 3 } },
          { text: '“Emek ve disiplinle ulaşılamayacak zirve yoktur.”', scores: { ambitious: 3 } },
          { text: '“Yollar yürümek için değil, kaybolmak ve kendini bulmak içindir.”', scores: { free_spirit: 3 } },
          { text: '“Görünenden fazlasını bil, bildiğinden azını konuş.”', scores: { mysterious: 3 } },
          { text: '“Korkularının bittiği yerde gerçek hayat başlar.”', scores: { adventurer: 3 } }
        ]
      },
      {
        id: 6,
        question: 'Başucunda duran kitap genellikle hangi türdendir?',
        options: [
          { text: 'Klasik aşk romanları, modern şiir derlemeleri veya dokunaklı anılar.', scores: { romantic: 3 } },
          { text: 'Liderlik, strateji, biyografi veya kişisel gelişim başyapıtları.', scores: { ambitious: 3 } },
          { text: 'Seyahat günlükleri, dünya mitolojisi veya felsefi denemeler.', scores: { free_spirit: 3 } },
          { text: 'Psikolojik gerilim, felsefe veya karanlık gizem romanları.', scores: { mysterious: 3 } },
          { text: 'Keşif günlükleri, aksiyon dolu kurgular veya hayatta kalma hikayeleri.', scores: { adventurer: 3 } }
        ]
      },
      {
        id: 7,
        question: 'Yeni biriyle tanıştığında onda ilk neye dikkat edersin?',
        options: [
          { text: 'Bakışlarındaki sıcaklığa, ses tonundaki samimiyete ve nezakete.', scores: { romantic: 3 } },
          { text: 'Kendini ifade edişindeki özgüvene, vizyonuna ve hedeflerine.', scores: { ambitious: 3 } },
          { text: 'Gözlerindeki hayat enerjisine ve kalıpların dışındaki esprilerine.', scores: { free_spirit: 3 } },
          { text: 'Söylediklerinden çok sakladığı ayrıntılara ve beden diline.', scores: { mysterious: 3 } },
          { text: 'Anlattığı ilginç hikayelere ve hayata karşı tutkulu duruşuna.', scores: { adventurer: 3 } }
        ]
      },
      {
        id: 8,
        question: 'Sana sihirli bir bilet verselerdi nereye gitmek isterdin?',
        options: [
          { text: 'Sonbaharda Venedik veya Verona — dar sokaklarda el ele yürümek.', scores: { romantic: 3 } },
          { text: 'Tokyo veya New York — dünyanın finans ve moda başkentinde zirveyi solumak.', scores: { ambitious: 3 } },
          { text: 'Kosta Rika’da yağmur ormanları veya Bali’de dalga sörfü.', scores: { free_spirit: 3 } },
          { text: 'Sisli İskoçya kaleleri veya eski bir Prag kütüphanesi.', scores: { mysterious: 3 } },
          { text: 'Patagonya buzulları veya Güney Afrika safarisi.', scores: { adventurer: 3 } }
        ]
      },
      {
        id: 9,
        question: 'Hayatta seni en çok üzen şey ne olurdu?',
        options: [
          { text: 'Duygularımın hafife alınması veya kalbimin kırılması.', scores: { romantic: 3 } },
          { text: 'Potansiyelimin altında kalmak veya zamanımı boşa harcamak.', scores: { ambitious: 3 } },
          { text: 'Bir rutine hapsolmak ve özgürlüğümün elimden alınması.', scores: { free_spirit: 3 } },
          { text: 'Beni anlamayan yüzeysel insanlarla vakit geçirmek zorunda kalmak.', scores: { mysterious: 3 } },
          { text: 'Hayatı sadece seyirci olarak izleyip hiçbir cesur adım atamamak.', scores: { adventurer: 3 } }
        ]
      }
    ]
  }
]

// ── YAKINDA GELECEK TESTLER PREVIEW ─────────────────────────
export const UPCOMING_QUIZZES = [
  {
    id: 'up-1',
    title: 'Hangi 90’lar Rom-Com Başrolüsün?',
    badge: 'PEK YAKINDA',
    tag: 'SİNEMA & NOSTALJİ',
    desc: 'Notting Hill mi, 10 Things I Hate About You mu? 90’ların unutulmaz romantik komedi karakterlerinden hangisisin?',
    color: '#D87A8C'
  },
  {
    id: 'up-2',
    title: 'Aura Rengin Senin Hakkında Ne Diyor?',
    badge: 'PEK YAKINDA',
    tag: 'ENERJİ & KİŞİLİK',
    desc: 'Lavanta mı, yakut kırmızısı mı, yoksa altın sarısı mı? Çevrene yaydığın gizli auranın rengini keşfet.',
    color: '#7EA28C'
  },
  {
    id: 'up-3',
    title: 'Hangi İmza Parfüm Notalarısın?',
    badge: 'PEK YAKINDA',
    tag: 'ESTETİK & DUYU',
    desc: 'Vanilya & amber mi, taze bergamot mu, yoksa yasemin & sedir ağacı mı? Ruhunun kokusunu öğren.',
    color: '#E8B54D'
  }
]
