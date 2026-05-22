
export function openNewTab(url) {
  const a = document.createElement('a');
  a.href = url;
  a.target = '_blank';
  a.rel = 'noopener noreferrer';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

export const STREAMING_PLATFORMS = [
  {
    id: 'ytmusic',
    name: 'YouTube',
    icon: '🔴',
    embedType: 'youtube',
    description: 'Cari & putar langsung dalam app via YouTube',
    color: '#FF0000',
    logo: null, // use inline SVG
    searchUrl: (q) => `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`,
    openUrl: 'https://www.youtube.com',
    hint: 'Cari lagu, artis, atau tempel link YouTube…',
  },
  {
    id: 'websearch',
    name: 'Web',
    icon: '🌐',
    embedType: 'websearch',
    description: 'SoundCloud · Spotify · Jamendo · FMA · ccMixter · archive.org & lainnya',
    color: '#6366f1',
    logo: null,
    openUrl: 'https://www.youtube.com',
    hint: 'Cari lagu/artis — SoundCloud, Spotify, Jamendo, Vimeo, Audiomack, Mixcloud…',
  },
  {
    id: 'radio',
    name: 'Radio',
    icon: '📻',
    embedType: 'radio',
    description: 'Radio populer dunia · 10 negara populer · genre lengkap',
    color: '#f59e0b',
    logo: null,
    openUrl: 'https://www.radio.net',
    hint: 'Pilih negara, genre, lalu stasiun…',
    countries: [
      {
        id: 'us', name: 'Amerika Serikat', flag: '🇺🇸', color: '#3b82f6',
        genres: [
          { id: 'pop', name: 'Pop / Top 40', icon: '🎵', color: '#3b82f6', stations: [
            { id: 'z100', name: 'Z100 New York (iHeart)', city: 'New York', url: 'https://stream.revma.ihrhls.com/zc406' },
            { id: 'kiis', name: 'KIIS FM Los Angeles', city: 'Los Angeles', url: 'https://stream.revma.ihrhls.com/zc1714' },
            { id: 'hot97', name: 'HOT 97 Hip-Hop', city: 'New York', url: 'https://ice9.securenetsystems.net/HOT97' },
            { id: 'top40-sf', name: 'Wild 94.9 SF', city: 'San Francisco', url: 'https://stream.revma.ihrhls.com/zc258' },
            { id: 'y100-miami', name: 'Y100 Miami', city: 'Miami', url: 'https://stream.revma.ihrhls.com/zc1178' },
            { id: 'power106', name: 'Power 106 LA (Hip-Hop/RnB)', city: 'Los Angeles', url: 'https://stream.revma.ihrhls.com/zc1866' },
          ]},
          { id: 'rock', name: 'Rock / Alternative', icon: '🎸', color: '#ef4444', stations: [
            { id: 'kroq', name: 'KROQ Alt Rock LA', city: 'Los Angeles', url: 'https://stream.revma.ihrhls.com/zc2922' },
            { id: 'metal-soma', name: 'Metal Detector (SomaFM)', city: 'San Francisco', url: 'https://ice1.somafm.com/metal-128-mp3' },
            { id: 'indie-pop', name: 'Indie Pop Rocks (SomaFM)', city: 'San Francisco', url: 'https://ice1.somafm.com/indiepop-128-mp3' },
            { id: 'folkfwd', name: 'Folk Forward (SomaFM)', city: 'San Francisco', url: 'https://ice1.somafm.com/folkfwd-128-mp3' },
            { id: 'punk-soma', name: 'Doomed (SomaFM Dark/Metal)', city: 'San Francisco', url: 'https://ice1.somafm.com/doomed-128-mp3' },
            { id: 'thetrip-soma', name: 'The Trip (SomaFM Psychedelic)', city: 'San Francisco', url: 'https://ice1.somafm.com/thetrip-128-mp3' },
          ]},
          { id: 'country', name: 'Country / Americana', icon: '🤠', color: '#92400e', stations: [
            { id: 'wsm', name: 'WSM 650 Nashville', city: 'Nashville', url: 'https://stream.revma.ihrhls.com/zc3226' },
            { id: 'nash-fm', name: 'Nash FM Country', city: 'National', url: 'https://stream.revma.ihrhls.com/zc3050' },
            { id: 'boot-liquor', name: 'Boot Liquor (Americana)', city: 'San Francisco', url: 'https://ice1.somafm.com/bootliquor-128-mp3' },
            { id: 'folkfwd2', name: 'Folk Forward (SomaFM)', city: 'San Francisco', url: 'https://ice1.somafm.com/folkfwd-128-mp3' },
            { id: 'country-bbq', name: 'Lonestar (Country BBQ)', city: 'Texas', url: 'https://stream.zeno.fm/lonestar-country' },
            { id: 'whiskey-soma', name: 'Whiskey Before Breakfast (SomaFM)', city: 'San Francisco', url: 'https://ice1.somafm.com/Whiskeybeforebr-128-mp3' },
          ]},
          { id: 'jazz', name: 'Jazz / Blues / Soul', icon: '🎷', color: '#7c3aed', stations: [
            { id: 'wbgo', name: 'WBGO Jazz 88.3 FM', city: 'New York', url: 'https://wbgo.streamguys1.com/wbgo128.mp3' },
            { id: 'sonicuniverse', name: 'Sonic Universe (SomaFM)', city: 'San Francisco', url: 'https://ice1.somafm.com/sonicuniverse-128-mp3' },
            { id: 'jazz-soma', name: 'Jazz (SomaFM)', city: 'San Francisco', url: 'https://ice1.somafm.com/jazz-128-mp3' },
            { id: 'blues-soma', name: 'Illinois Street Lounge (Blues)', city: 'San Francisco', url: 'https://ice1.somafm.com/illstreet-128-mp3' },
            { id: 'sf1033', name: 'SF in SF (Jazz/Talk)', city: 'San Francisco', url: 'https://ice1.somafm.com/sf1033-128-mp3' },
            { id: 'groove-salad', name: 'Groove Salad (SomaFM)', city: 'San Francisco', url: 'https://ice1.somafm.com/groovesalad-128-mp3' },
          ]},
          { id: 'hiphop', name: 'Hip-Hop / R&B', icon: '🎤', color: '#f59e0b', stations: [
            { id: 'soulful-soma', name: 'SoulfulSide (SomaFM)', city: 'San Francisco', url: 'https://ice1.somafm.com/SoulfulSide-128-mp3' },
            { id: 'hiphop-zeno', name: 'Hip-Hop Radio USA', city: 'New York', url: 'https://stream.zeno.fm/hiphop-usa' },
            { id: 'oldschool-hiphop', name: 'Old School Hip-Hop', city: 'Online', url: 'https://stream.laut.fm/oldschoolhiphop' },
            { id: 'rnb-zeno', name: 'R&B United States', city: 'Atlanta', url: 'https://stream.zeno.fm/rnb-united-states' },
            { id: 'trap-radio', name: 'Trap Nation Radio', city: 'Online', url: 'https://stream.zeno.fm/trap-nation' },
            { id: 'rap-us', name: 'Rap Radio USA', city: 'Online', url: 'https://stream.laut.fm/rap' },
          ]},
          { id: 'electronic', name: 'Electronic / Dance', icon: '🎧', color: '#8b5cf6', stations: [
            { id: 'deptstore-soma', name: 'Dept. Store (SomaFM Lo-Fi)', city: 'San Francisco', url: 'https://ice1.somafm.com/deptstore-128-mp3' },
            { id: 'cliqhop', name: 'cliqhop idm (SomaFM)', city: 'San Francisco', url: 'https://ice1.somafm.com/cliqhop-128-mp3' },
            { id: 'edm-radio', name: 'EDM Radio US', city: 'New York', url: 'https://stream.zeno.fm/edm-radio' },
            { id: 'house-nation', name: 'House Nation Radio', city: 'Chicago', url: 'https://stream.laut.fm/house' },
            { id: 'dubstep-radio', name: 'Dubstep Radio US', city: 'Online', url: 'https://stream.zeno.fm/dubstep-radio' },
            { id: 'techno-us', name: 'Techno USA (Laut.fm)', city: 'Online', url: 'https://stream.laut.fm/techno' },
          ]},
          { id: 'news', name: 'News / Talk', icon: '📰', color: '#64748b', stations: [
            { id: 'npr', name: 'NPR News Now', city: 'National', url: 'https://npr-ice.streamguys1.com/live.mp3' },
            { id: 'wtop', name: 'WTOP News 103.5', city: 'Washington DC', url: 'https://stream.revma.ihrhls.com/zc2754' },
            { id: 'kcbs', name: 'KCBS News Radio', city: 'San Francisco', url: 'https://stream.revma.ihrhls.com/zc578' },
            { id: 'wbbm', name: 'WBBM Newsradio', city: 'Chicago', url: 'https://stream.revma.ihrhls.com/zc402' },
            { id: 'kogo', name: 'KOGO News San Diego', city: 'San Diego', url: 'https://stream.revma.ihrhls.com/zc2474' },
            { id: 'bbc-world-us', name: 'BBC World Service', city: 'London/National', url: 'https://stream.live.vc.bbcmedia.co.uk/bbc_world_service' },
          ]},
        ],
      },
      {
        id: 'uk', name: 'Inggris', flag: '🇬🇧', color: '#e11d48',
        genres: [
          { id: 'pop', name: 'Pop / Chart Hits', icon: '🎵', color: '#e11d48', stations: [
            { id: 'bbc-r1', name: 'BBC Radio 1', city: 'London', url: 'https://stream.live.vc.bbcmedia.co.uk/bbc_radio_one' },
            { id: 'heart', name: 'Heart FM', city: 'London', url: 'https://media-ice.musicradio.com/HeartUKMP3' },
            { id: 'capital', name: 'Capital FM', city: 'London', url: 'https://media-ice.musicradio.com/CapitalUKMP3' },
            { id: 'absolute', name: 'Absolute Radio', city: 'London', url: 'https://media-ice.musicradio.com/AbsoluteRadioMP3' },
            { id: 'magic-uk', name: 'Magic FM', city: 'London', url: 'https://media-ice.musicradio.com/MagicUKMP3' },
            { id: 'bbc-r2', name: 'BBC Radio 2 (Easy Listening)', city: 'London', url: 'https://stream.live.vc.bbcmedia.co.uk/bbc_radio_two' },
          ]},
          { id: 'rock', name: 'Rock / Alternative', icon: '🎸', color: '#dc2626', stations: [
            { id: 'kerrang', name: 'Kerrang! Radio', city: 'Birmingham', url: 'https://media-ice.musicradio.com/KerrangMP3' },
            { id: 'planet-rock', name: 'Planet Rock', city: 'London', url: 'https://media-ice.musicradio.com/PlanetRockMP3' },
            { id: 'absolute-rock', name: 'Absolute Radio Rock', city: 'London', url: 'https://media-ice.musicradio.com/AbsoluteRadioRockMP3' },
            { id: 'radio-x', name: 'Radio X', city: 'London', url: 'https://media-ice.musicradio.com/RadioXUKMP3' },
            { id: 'absolute-80s', name: 'Absolute 80s', city: 'London', url: 'https://media-ice.musicradio.com/Absolute80sMP3' },
            { id: 'absolute-90s', name: 'Absolute 90s', city: 'London', url: 'https://media-ice.musicradio.com/Absolute90sMP3' },
          ]},
          { id: 'classical', name: 'Classical / Jazz', icon: '🎻', color: '#7c3aed', stations: [
            { id: 'bbc-r3', name: 'BBC Radio 3 (Classical)', city: 'London', url: 'https://stream.live.vc.bbcmedia.co.uk/bbc_radio_three' },
            { id: 'classic-fm', name: 'Classic FM', city: 'London', url: 'https://media-ice.musicradio.com/ClassicFMMP3' },
            { id: 'smooth', name: 'Smooth Radio', city: 'London', url: 'https://media-ice.musicradio.com/SmoothUKMP3' },
            { id: 'jazz-fm', name: 'Jazz FM', city: 'London', url: 'https://streaming.radio.co/s2a648cde8/listen' },
            { id: 'lyric-fm', name: 'Lyric FM (Ireland)', city: 'Dublin', url: 'https://icecast.rte.ie/lyricfm.mp3' },
            { id: 'bbc-r3-jazz', name: 'BBC Radio 3 Late Jn (Jazz)', city: 'London', url: 'https://stream.live.vc.bbcmedia.co.uk/bbc_radio_three' },
          ]},
          { id: 'dance', name: 'Dance / Electronic', icon: '🎧', color: '#8b5cf6', stations: [
            { id: 'kiss-uk', name: 'KISS FM UK', city: 'London', url: 'https://media-ice.musicradio.com/KISSUKHD' },
            { id: 'capital-xtra', name: 'Capital XTRA', city: 'London', url: 'https://media-ice.musicradio.com/CapitalXtraMP3' },
            { id: 'kiss-fresh', name: 'KISS Fresh', city: 'London', url: 'https://media-ice.musicradio.com/KISSFRESHMP3' },
            { id: 'magic-chilled', name: 'Magic Chilled', city: 'London', url: 'https://media-ice.musicradio.com/MagicChilledMP3' },
            { id: 'radio-1xtra', name: 'BBC Radio 1Xtra (Urban)', city: 'London', url: 'https://stream.live.vc.bbcmedia.co.uk/bbc_1xtra' },
            { id: 'bbc-r6', name: 'BBC Radio 6 Music (Alternative)', city: 'London', url: 'https://stream.live.vc.bbcmedia.co.uk/bbc_6music' },
          ]},
          { id: 'hiphop-uk', name: 'Hip-Hop / Grime / RnB', icon: '🎤', color: '#f59e0b', stations: [
            { id: 'bbc-1xtra-uk', name: 'BBC Radio 1Xtra', city: 'London', url: 'https://stream.live.vc.bbcmedia.co.uk/bbc_1xtra' },
            { id: 'rinse-fm', name: 'Rinse FM (Grime/Electronic)', city: 'London', url: 'https://stream.zeno.fm/rinse-fm-uk' },
            { id: 'complex-uk', name: 'Complex UK Urban', city: 'London', url: 'https://stream.zeno.fm/complex-uk' },
            { id: 'kiss-uk-urban', name: 'KISS FM UK Urban', city: 'London', url: 'https://media-ice.musicradio.com/KISSUKHD' },
            { id: 'reprezent', name: 'Reprezent Radio 107.3 FM', city: 'London', url: 'https://stream.zeno.fm/reprezent-uk' },
            { id: 'uk-rnb', name: 'UK R&B Station (Laut.fm)', city: 'Online', url: 'https://stream.laut.fm/rnb' },
          ]},
          { id: 'oldies', name: 'Oldies / Heritage', icon: '🕰️', color: '#d97706', stations: [
            { id: 'magic-uk2', name: 'Magic Radio (Gold Hits)', city: 'London', url: 'https://media-ice.musicradio.com/MagicUKMP3' },
            { id: 'gold-uk', name: 'Gold Radio UK', city: 'London', url: 'https://media-ice.musicradio.com/GoldMP3' },
            { id: 'greatest-hits', name: 'Greatest Hits Radio', city: 'London', url: 'https://media-ice.musicradio.com/GreatestHitsMP3' },
            { id: 'bbc-r4extra', name: 'BBC Radio 4 Extra (Vintage)', city: 'London', url: 'https://stream.live.vc.bbcmedia.co.uk/bbc_radio_four_extra' },
            { id: 'absolute-classic', name: 'Absolute Classic Rock', city: 'London', url: 'https://media-ice.musicradio.com/AbsoluteClassicRockMP3' },
            { id: 'bbc-sounds-uk', name: 'BBC Radio 2 (Pop Oldies)', city: 'London', url: 'https://stream.live.vc.bbcmedia.co.uk/bbc_radio_two' },
          ]},
          { id: 'news', name: 'News / Talk', icon: '📰', color: '#64748b', stations: [
            { id: 'bbc-world', name: 'BBC World Service', city: 'London', url: 'https://stream.live.vc.bbcmedia.co.uk/bbc_world_service' },
            { id: 'bbc-r4', name: 'BBC Radio 4', city: 'London', url: 'https://stream.live.vc.bbcmedia.co.uk/bbc_radio_fourfm' },
            { id: 'lbc', name: 'LBC News', city: 'London', url: 'https://media-ice.musicradio.com/LBCMP3' },
            { id: 'times-radio', name: 'Times Radio', city: 'London', url: 'https://timesradio.wireless.radio/stream' },
            { id: 'bbc-r5', name: 'BBC Radio 5 Live', city: 'London', url: 'https://stream.live.vc.bbcmedia.co.uk/bbc_radio_five_live' },
            { id: 'talkradio-uk', name: 'Talk Radio UK', city: 'London', url: 'https://media-ice.musicradio.com/TalkRadioUKMP3' },
          ]},
        ],
      },
      {
        id: 'fr', name: 'Prancis', flag: '🇫🇷', color: '#3b82f6',
        genres: [
          { id: 'pop', name: 'Pop / Variété', icon: '🎵', color: '#3b82f6', stations: [
            { id: 'nrj', name: 'NRJ', city: 'Paris', url: 'https://scdn.nrjaudio.fm/adwz2/fr/30001/mp3_128.mp3' },
            { id: 'nostalgie', name: 'Nostalgie', city: 'Paris', url: 'https://scdn.nrjaudio.fm/adwz2/fr/30700/mp3_128.mp3' },
            { id: 'cherie', name: 'Chérie FM', city: 'Paris', url: 'https://scdn.nrjaudio.fm/adwz2/fr/30201/mp3_128.mp3' },
            { id: 'france-inter', name: 'France Inter', city: 'Paris', url: 'https://icecast.radiofrance.fr/franceinter-midfi.mp3' },
            { id: 'europe1', name: 'Europe 1', city: 'Paris', url: 'https://stream.europe1.fr/europe1.mp3' },
            { id: 'rtl-fr', name: 'RTL France', city: 'Paris', url: 'https://streaming.radio.rtl.fr/rtl-1-44-96' },
          ]},
          { id: 'dance', name: 'Dance / Électro', icon: '🎧', color: '#8b5cf6', stations: [
            { id: 'fip-electro', name: 'FIP Électro', city: 'Paris', url: 'https://icecast.radiofrance.fr/fipelectro-midfi.mp3' },
            { id: 'fip', name: 'FIP (Jazz/Électro/World)', city: 'Paris', url: 'https://icecast.radiofrance.fr/fip-midfi.mp3' },
            { id: 'radio-meuh', name: 'Radio Meuh (Electro/Indie)', city: 'Paris', url: 'https://radiomeuh.ice.infomaniak.ch/radiomeuh-128.mp3' },
            { id: 'mouv', name: "Mouv' (Urban/Electro)", city: 'Paris', url: 'https://icecast.radiofrance.fr/mouv-midfi.mp3' },
            { id: 'fip-groove', name: 'FIP Groove', city: 'Paris', url: 'https://icecast.radiofrance.fr/fipgroove-midfi.mp3' },
            { id: 'fun-radio', name: 'Fun Radio (Dance/RnB)', city: 'Paris', url: 'https://stream.funradio.fr/fun-1-48-128' },
          ]},
          { id: 'classical', name: 'Classique / Jazz', icon: '🎻', color: '#7c3aed', stations: [
            { id: 'france-musique', name: 'France Musique', city: 'Paris', url: 'https://icecast.radiofrance.fr/francemusique-midfi.mp3' },
            { id: 'radio-classique', name: 'Radio Classique', city: 'Paris', url: 'https://radioclassique.ice.infomaniak.ch/radioclassique-high' },
            { id: 'tsfjazz', name: 'TSF Jazz', city: 'Paris', url: 'https://tsfjazz.ice.infomaniak.ch/tsfjazz-high' },
            { id: 'fip-jazz', name: 'FIP Jazz', city: 'Paris', url: 'https://icecast.radiofrance.fr/fipjazz-midfi.mp3' },
            { id: 'fip-world', name: 'FIP Monde (World Music)', city: 'Paris', url: 'https://icecast.radiofrance.fr/fipworld-midfi.mp3' },
            { id: 'fip-reggae', name: 'FIP Reggae', city: 'Paris', url: 'https://icecast.radiofrance.fr/fipreggae-midfi.mp3' },
          ]},
          { id: 'rnb', name: 'R&B / Hip-Hop / Urban', icon: '🎤', color: '#f59e0b', stations: [
            { id: 'skyrock', name: 'Skyrock (Hip-Hop/RnB)', city: 'Paris', url: 'https://stream.skyrock.com/skyrock-128.mp3' },
            { id: 'mouv2', name: "Mouv' 100% Urban", city: 'Paris', url: 'https://icecast.radiofrance.fr/mouv-midfi.mp3' },
            { id: 'rfm', name: 'RFM (Soul/Variété)', city: 'Paris', url: 'https://rfm.ice.infomaniak.ch/rfm-high.mp3' },
            { id: 'virgin-radio', name: 'Virgin Radio France', city: 'Paris', url: 'https://virgin.ice.infomaniak.ch/virgin-high.mp3' },
            { id: 'rap-fr', name: 'Rap Radio France (Laut.fm)', city: 'Paris', url: 'https://stream.laut.fm/rap' },
            { id: 'oui-fm', name: 'OUI FM (Rock/Urban)', city: 'Paris', url: 'https://ouifm.ice.infomaniak.ch/ouifm-high.mp3' },
          ]},
          { id: 'rock-fr', name: 'Rock / Metal', icon: '🎸', color: '#dc2626', stations: [
            { id: 'riffx', name: 'RIFFX (Metal/Punk)', city: 'Paris', url: 'https://stream.riffx.fr/riffx-128.mp3' },
            { id: 'nova-fr', name: 'Radio Nova (Funk/Soul/Indie)', city: 'Paris', url: 'https://novazz.ice.infomaniak.ch/nova-high.mp3' },
            { id: 'radio-metal-fr', name: 'Radio Metal France', city: 'Lyon', url: 'https://stream.zeno.fm/radiometal-fr' },
            { id: 'oui-rock', name: 'OUI FM Rock', city: 'Paris', url: 'https://ouifm.ice.infomaniak.ch/ouifm-high.mp3' },
            { id: 'heavy1-fr', name: 'Heavy One (Metal/Hardcore)', city: 'Paris', url: 'https://stream.laut.fm/heavy1' },
            { id: 'fip-pop', name: 'FIP Pop (Indie/Altpop)', city: 'Paris', url: 'https://icecast.radiofrance.fr/fippop-midfi.mp3' },
          ]},
          { id: 'chanson', name: 'Chanson Française', icon: '🇫🇷', color: '#1d4ed8', stations: [
            { id: 'france-bleu', name: 'France Bleu (Chanson/Régional)', city: 'Paris', url: 'https://icecast.radiofrance.fr/francebleu-midfi.mp3' },
            { id: 'rire-chansons', name: 'Rire et Chansons', city: 'Paris', url: 'https://scdn.nrjaudio.fm/adwz2/fr/30401/mp3_128.mp3' },
            { id: 'chanson-classique', name: 'Chanson Classique (Nostalgie)', city: 'Paris', url: 'https://scdn.nrjaudio.fm/adwz2/fr/30700/mp3_128.mp3' },
            { id: 'vibration-fr', name: 'Vibration FM', city: 'Paris', url: 'https://stream.vibration.fr/vibration-128.mp3' },
            { id: 'radio-bleue', name: 'Radio Bleue (Variété/Chanson)', city: 'Paris', url: 'https://stream.zeno.fm/radio-bleue-fr' },
            { id: 'voltage-fr', name: 'Voltage FM', city: 'Paris', url: 'https://stream.voltage.fr/voltage-128.mp3' },
          ]},
          { id: 'news', name: 'Info / Actualités', icon: '📰', color: '#64748b', stations: [
            { id: 'france-info', name: 'Franceinfo', city: 'Paris', url: 'https://icecast.radiofrance.fr/franceinfo-midfi.mp3' },
            { id: 'france-culture', name: 'France Culture', city: 'Paris', url: 'https://icecast.radiofrance.fr/franceculture-midfi.mp3' },
            { id: 'rfi', name: 'RFI Monde', city: 'Paris', url: 'https://icecast.radiofrance.fr/rfi-midfi.mp3' },
            { id: 'bfm-radio', name: 'BFM Radio', city: 'Paris', url: 'https://bfmradio.ice.infomaniak.ch/bfmradio-high.mp3' },
            { id: 'rmc', name: 'RMC Info', city: 'Paris', url: 'https://rmc.bfmtv.com/rmc-128.mp3' },
            { id: 'france-inter-news', name: 'France Inter (News/Talk)', city: 'Paris', url: 'https://icecast.radiofrance.fr/franceinter-midfi.mp3' },
          ]},
        ],
      },
      {
        id: 'de', name: 'Jerman', flag: '🇩🇪', color: '#fbbf24',
        genres: [
          { id: 'pop', name: 'Pop / Charts', icon: '🎵', color: '#fbbf24', stations: [
            { id: 'antenne', name: 'Antenne Bayern', city: 'Munich', url: 'https://s1-webradio.antenne.de/antenne' },
            { id: 'bigfm', name: 'BigFM Deutschland', city: 'Stuttgart', url: 'https://streams.bigfm.de/bigfm-deutschland-128-mp3' },
            { id: 'hit-ffh', name: 'Hit Radio FFH', city: 'Frankfurt', url: 'https://streams.ffh.de/radioffh/mp3/256' },
            { id: 'nrj-de', name: 'Energy Radio', city: 'München', url: 'https://scdn.nrjaudio.fm/adwz2/de/33001/mp3_128.mp3' },
            { id: 'radio-bob', name: 'Radio BOB! (Rock/Pop)', city: 'Kassel', url: 'https://streams.radiobob.de/bob-national/mp3-192/streams.radiobob.de/' },
            { id: 'hr3-de', name: 'HR3 (Pop/80s)', city: 'Frankfurt', url: 'https://hr-hr3-live.cast.addradio.de/hr/hr3/live/mp3/128/stream.mp3' },
          ]},
          { id: 'dance', name: 'Electronic / Dance', icon: '🎧', color: '#8b5cf6', stations: [
            { id: 'sunshine-live', name: 'sunshine live (Techno/House)', city: 'Mannheim', url: 'https://stream.sunshine-live.de/live/mp3-128' },
            { id: 'flux-deep', name: 'FluxFM Chillhop', city: 'Berlin', url: 'https://streams.fluxfm.de/Chillhop/mp3-320/streams.fluxfm.de/' },
            { id: 'dance-de', name: 'FluxFM Dance', city: 'Berlin', url: 'https://streams.fluxfm.de/Dance/mp3-128/streams.fluxfm.de/' },
            { id: 'bigfm-dance', name: 'BigFM Dance', city: 'Stuttgart', url: 'https://streams.bigfm.de/bigfm-dance-128-mp3' },
            { id: 'clubbing-fluxfm', name: 'FluxFM Clubbing', city: 'Berlin', url: 'https://streams.fluxfm.de/Clubbing/mp3-128/streams.fluxfm.de/' },
            { id: 'techno-de', name: 'Techno Station DE (Laut.fm)', city: 'Berlin', url: 'https://stream.laut.fm/techno' },
          ]},
          { id: 'classical', name: 'Klassik / Kultur', icon: '🎻', color: '#7c3aed', stations: [
            { id: 'deutschlandradio', name: 'Deutschlandradio Kultur', city: 'Berlin', url: 'https://st01.sslstream.dlf.de/dlf/01/128/mp3/stream.mp3' },
            { id: 'dlf', name: 'Deutschlandfunk', city: 'Cologne', url: 'https://st02.sslstream.dlf.de/dlf/02/128/mp3/stream.mp3' },
            { id: 'wdr3', name: 'WDR 3 (Klassik/Kultur)', city: 'Cologne', url: 'https://wdr-wdr3-live.icecastssl.wdr.de/wdr/wdr3/live/mp3/128/stream.mp3' },
            { id: 'br-klassik', name: 'BR-Klassik', city: 'Munich', url: 'https://dispatcher.rndfnk.com/br/brklassik/live/mp3/low' },
            { id: 'rbb-kultur', name: 'rbb Kulturradio', city: 'Berlin', url: 'https://rbb-kulturradio-live.sslcast.addradio.de/rbb/kulturradio/live/mp3/128/stream.mp3' },
            { id: 'ndr-kultur', name: 'NDR Kultur', city: 'Hamburg', url: 'https://ndr-ndrkultur-live.sslcast.addradio.de/ndr/ndrkultur/live/mp3/128/stream.mp3' },
          ]},
          { id: 'schlager', name: 'Schlager / Volksmusik', icon: '🍺', color: '#d97706', stations: [
            { id: 'schlager-radio', name: 'Schlager Radio', city: 'Online', url: 'https://stream.laut.fm/schlager' },
            { id: 'antenne-schlager', name: 'Antenne Bayern Schlager', city: 'Munich', url: 'https://s4-webradio.antenne.de/schlager' },
            { id: 'bigfm-schlager', name: 'BigFM Schlager', city: 'Stuttgart', url: 'https://streams.bigfm.de/bigfm-schlager-128-mp3' },
            { id: 'volksmusik', name: 'Antenne Bayern Volksmusik', city: 'Munich', url: 'https://s5-webradio.antenne.de/volksmusik' },
            { id: 'mdr-jump', name: 'MDR Jump (Schlager/Pop)', city: 'Leipzig', url: 'https://mdr-jump-live.icecastssl.mdr.de/mdr/jump/live/mp3/128/stream.mp3' },
            { id: 'schlagerplanet', name: 'Schlagerplanet Radio', city: 'Online', url: 'https://stream.zeno.fm/schlagerplanet' },
          ]},
          { id: 'rock-de', name: 'Rock / Metal', icon: '🎸', color: '#ef4444', stations: [
            { id: 'metal1-de', name: 'Metal 1 Radio', city: 'Online', url: 'https://stream.metal1.eu/metal1' },
            { id: 'radiobob-metal', name: 'Radio BOB! Metal', city: 'Kassel', url: 'https://streams.radiobob.de/bob-metal/mp3-128/streams.radiobob.de/' },
            { id: 'rock-antenne', name: 'Rock Antenne Bayern', city: 'Munich', url: 'https://s5-webradio.antenne.de/rock-antenne' },
            { id: 'radio-fritz', name: 'Radio Fritz (Alternative)', city: 'Berlin', url: 'https://fritz-live.sslcast.addradio.de/fritz/live/mp3/128/stream.mp3' },
            { id: 'flux-berlin', name: 'FluxFM Berlin (Indie Rock)', city: 'Berlin', url: 'https://streams.fluxfm.de/fluxfm/mp3-128/streams.fluxfm.de/' },
            { id: 'bigfm-rock', name: 'BigFM Rock', city: 'Stuttgart', url: 'https://streams.bigfm.de/bigfm-rock-128-mp3' },
          ]},
          { id: 'hiphop-de', name: 'Hip-Hop / RnB DE', icon: '🎤', color: '#10b981', stations: [
            { id: 'bigfm-hiphop', name: 'BigFM Hip-Hop', city: 'Stuttgart', url: 'https://streams.bigfm.de/bigfm-hiphop-128-mp3' },
            { id: 'energy-hiphop', name: 'Energy Hip-Hop DE', city: 'München', url: 'https://scdn.nrjaudio.fm/adwz2/de/33009/mp3_128.mp3' },
            { id: 'rap-de', name: 'Rap Radio Deutschland', city: 'Berlin', url: 'https://stream.laut.fm/rapde' },
            { id: 'rnb-de', name: 'R&B Radio DE (Zeno)', city: 'Berlin', url: 'https://stream.zeno.fm/rnb-deutschland' },
            { id: 'flavor-de', name: 'Flavor Radio DE (Urban)', city: 'Hamburg', url: 'https://stream.zeno.fm/flavor-radio-de' },
            { id: 'flux-hiphop', name: 'FluxFM Hip-Hop', city: 'Berlin', url: 'https://streams.fluxfm.de/HipHop/mp3-128/streams.fluxfm.de/' },
          ]},
          { id: 'news', name: 'News / Nachrichten', icon: '📰', color: '#64748b', stations: [
            { id: 'inforadio', name: 'Inforadio rbb', city: 'Berlin', url: 'https://rbb-inforadio-live.sslcast.addradio.de/rbb/inforadio/live/mp3/128/stream.mp3' },
            { id: 'b5-aktuell', name: 'Bayern 5 aktuell', city: 'Munich', url: 'https://dispatcher.rndfnk.com/br/br5/live/mp3/low' },
            { id: 'wdr5', name: 'WDR 5 (News/Talk)', city: 'Cologne', url: 'https://wdr-wdr5-live.icecastssl.wdr.de/wdr/wdr5/live/mp3/128/stream.mp3' },
            { id: 'swr-aktuell', name: 'SWR Aktuell', city: 'Stuttgart', url: 'https://liveradio.swr.de/sw282p3/swr-aktuell/play.mp3' },
            { id: 'ndr-info', name: 'NDR Info', city: 'Hamburg', url: 'https://ndr-ndrinfo-live.sslcast.addradio.de/ndr/ndrinfo/live/mp3/128/stream.mp3' },
            { id: 'deutschlandradio-news', name: 'Deutschlandfunk Nova', city: 'Cologne', url: 'https://st03.sslstream.dlf.de/dlf/03/128/mp3/stream.mp3' },
          ]},
        ],
      },
      {
        id: 'id', name: 'Indonesia', flag: '🇮🇩', color: '#ef4444',
        genres: [
          { id: 'pop', name: 'Pop / Top 40', icon: '🎵', color: '#ef4444', stations: [
            { id: 'prambors', name: 'Prambors FM', city: 'Jakarta', url: 'https://n06.radiojar.com/prambors.mp3' },
            { id: 'gen', name: 'Gen FM Jakarta', city: 'Jakarta', url: 'https://n06.radiojar.com/genfm.mp3' },
            { id: 'jak-fm', name: 'Jak FM', city: 'Jakarta', url: 'https://edge.iono.fm/c/546/icecast.audio' },
            { id: 'female', name: 'Female Radio Jakarta', city: 'Jakarta', url: 'https://stream.zeno.fm/y3u7jfkhc0zuv' },
            { id: 'ria-fm', name: 'Ria FM Jakarta', city: 'Jakarta', url: 'https://stream.zeno.fm/riafm-jakarta' },
            { id: 'trenda-fm', name: 'Trenda 97.5 FM', city: 'Jakarta', url: 'https://stream.zeno.fm/trendafm975' },
          ]},
          { id: 'dangdut', name: 'Dangdut / Koplo', icon: '🥁', color: '#f59e0b', stations: [
            { id: 'dangdut-id', name: 'Radio Dangdut Indonesia', city: 'Jakarta', url: 'https://edge.iono.fm/c/562/icecast.audio' },
            { id: 'dangdut3', name: 'Nada FM (Dangdut)', city: 'Semarang', url: 'https://stream.zeno.fm/8k8p44uu9feuv' },
            { id: 'dangdut4', name: 'Koplo Station', city: 'Surabaya', url: 'https://stream.zeno.fm/4g0vf8mzwhzuv' },
            { id: 'ms-tri', name: 'Ms Tri FM (Dangdut Jawa)', city: 'Semarang', url: 'https://stream.zeno.fm/mstrifm' },
            { id: 'irama-fm', name: 'Irama FM (Dangdut Klasik)', city: 'Bandung', url: 'https://stream.zeno.fm/iramafm-bdg' },
            { id: 'rhoma-station', name: 'Rhoma Irama Station', city: 'Jakarta', url: 'https://stream.zeno.fm/dangdut-klasik-id' },
          ]},
          { id: 'rock', name: 'Rock / Indie / Metal', icon: '🎸', color: '#dc2626', stations: [
            { id: 'hardrock-jkt', name: 'Hard Rock FM Jakarta', city: 'Jakarta', url: 'https://edge.iono.fm/c/533/icecast.audio' },
            { id: 'trax', name: 'Trax FM Jakarta', city: 'Jakarta', url: 'https://edge.iono.fm/c/543/icecast.audio' },
            { id: 'oz-bdg', name: 'OZ Radio Bandung', city: 'Bandung', url: 'https://stream.zeno.fm/7qhq1k7d5fzuv' },
            { id: 'ardan', name: 'Ardan Radio Bandung', city: 'Bandung', url: 'https://edge.iono.fm/c/558/icecast.audio' },
            { id: 'metal-id', name: 'Metal Radio Indonesia', city: 'Online', url: 'https://stream.zeno.fm/metal-indonesia' },
            { id: 'indie-id', name: 'Indie Radio Indonesia', city: 'Bandung', url: 'https://stream.zeno.fm/indie-id-bdg' },
          ]},
          { id: 'religi', name: 'Religi / Islami', icon: '🕌', color: '#10b981', stations: [
            { id: 'rodja', name: 'Radio Rodja 756 AM', city: 'Bogor', url: 'https://stream.rodja.com:8000/stream.mp3' },
            { id: 'dakwah', name: 'Suara Muslim Radio', city: 'Surabaya', url: 'https://stream.zeno.fm/rxy5bwgq7eeuv' },
            { id: 'hijrah-fm', name: 'Hijrah FM', city: 'Jakarta', url: 'https://stream.zeno.fm/1g4pf5e8gh8uv' },
            { id: 'alquran-rt', name: 'Radio Al-Quran RT', city: 'Jakarta', url: 'https://stream.zeno.fm/vhbpetpjtpzuv' },
            { id: 'mqfm-bdg', name: 'MQ FM Bandung (Religi)', city: 'Bandung', url: 'https://stream.zeno.fm/yw8tyaay7jzuv' },
            { id: 'global-fm-religi', name: 'Global FM (Islami)', city: 'Surabaya', url: 'https://stream.zeno.fm/globalfm-sby-religi' },
          ]},
          { id: 'campursari', name: 'Campursari / Jawa', icon: '🎎', color: '#a16207', stations: [
            { id: 'cs-solo', name: 'Radio Silaturahim (Campursari)', city: 'Solo', url: 'https://stream.zeno.fm/campursari-solo' },
            { id: 'cs-jogja', name: 'Geronimo FM Jogja (Jawa)', city: 'Yogyakarta', url: 'https://stream.zeno.fm/geronimofm-jog' },
            { id: 'retjo-buntung', name: 'Retjo Buntung FM', city: 'Yogyakarta', url: 'https://stream.zeno.fm/retjobuntung-fm' },
            { id: 'sas-fm', name: 'SAS FM Surakarta (Campursari)', city: 'Solo', url: 'https://stream.zeno.fm/sasfm-solo' },
            { id: 'gamelan-id', name: 'Gamelan Indonesia Radio', city: 'Online', url: 'https://stream.zeno.fm/gamelan-indonesia' },
            { id: 'kiai-kanjeng', name: 'Jawa Klasik (Ketoprak/Wayang)', city: 'Semarang', url: 'https://stream.zeno.fm/wayang-jawa-id' },
          ]},
          { id: 'rnb-id', name: 'R&B / Hip-Hop / Urban', icon: '🎤', color: '#8b5cf6', stations: [
            { id: 'i-radio', name: 'I-Radio Jakarta', city: 'Jakarta', url: 'https://edge.iono.fm/c/541/icecast.audio' },
            { id: 'pass-fm', name: 'Pass FM Jakarta (RnB/Urban)', city: 'Jakarta', url: 'https://stream.zeno.fm/passfm-jkt' },
            { id: 'hiphop-id', name: 'Hip-Hop Indonesia Radio', city: 'Online', url: 'https://stream.zeno.fm/hiphop-indonesia' },
            { id: 'urban-id', name: 'Urban Radio Indonesia', city: 'Jakarta', url: 'https://stream.zeno.fm/urban-radio-id' },
            { id: 'rnb-id-zeno', name: 'R&B Indonesia (Zeno)', city: 'Jakarta', url: 'https://stream.zeno.fm/rnb-id-jkt' },
            { id: 'kiss-fm-id', name: 'Kiss FM Jakarta', city: 'Jakarta', url: 'https://stream.zeno.fm/kissfm-jkt' },
          ]},
          { id: 'news', name: 'Berita / Talkshow', icon: '📰', color: '#64748b', stations: [
            { id: 'elshinta', name: 'Elshinta News & Talk', city: 'Jakarta', url: 'https://edge.iono.fm/c/538/icecast.audio' },
            { id: 'smart-fm', name: 'Smart FM Jakarta', city: 'Jakarta', url: 'https://edge.iono.fm/c/548/icecast.audio' },
            { id: 'sonora', name: 'Sonora FM (Kompas)', city: 'Jakarta', url: 'https://edge.iono.fm/c/544/icecast.audio' },
            { id: 'rri-pro3', name: 'RRI Pro 3 Jakarta', city: 'Jakarta', url: 'https://edge.iono.fm/c/3/icecast.audio' },
            { id: 'rri-pro1', name: 'RRI Pro 1 Nasional', city: 'Jakarta', url: 'https://edge.iono.fm/c/1/icecast.audio' },
            { id: 'metro-jaya', name: 'Radio Metro Jaya', city: 'Jakarta', url: 'https://stream.zeno.fm/ksbmhpb0e8zuv' },
          ]},
        ],
      },
      {
        id: 'jp', name: 'Jepang', flag: '🇯🇵', color: '#e11d48',
        genres: [
          { id: 'jpop', name: 'J-Pop / City Pop', icon: '🌸', color: '#e11d48', stations: [
            { id: 'j1-jpop', name: 'J1 Radio J-Pop', city: 'Online', url: 'https://j1.streams.radiomast.io/fm/j1jpop/stream.mp3' },
            { id: 'j1-hits', name: 'J1 Hits', city: 'Online', url: 'https://j1.streams.radiomast.io/fm/j1hits/stream.mp3' },
            { id: 'j1-oldschool', name: 'J1 Old School J-Pop', city: 'Online', url: 'https://j1.streams.radiomast.io/fm/j1oldschool/stream.mp3' },
            { id: 'j-pop-sakura', name: 'J-Pop Sakura 108', city: 'Online', url: 'https://igor.torontocast.com:1025/;' },
            { id: 'nack5', name: 'NACK5 (FM埼玉)', city: 'Saitama', url: 'https://nack5-hls-stream.nack5.co.jp/nack5/nack5.m3u8' },
            { id: 'citypop-jp', name: 'City Pop Japan Radio', city: 'Online', url: 'https://stream.laut.fm/citypop' },
          ]},
          { id: 'anime', name: 'Anime / Game OST', icon: '🎌', color: '#f43f5e', stations: [
            { id: 'anison1', name: 'Anison Radio (AnimeNfo)', city: 'Online', url: 'https://pool.anr.io/anisonfm.mp3' },
            { id: 'j1-anime', name: 'J1 Anime', city: 'Online', url: 'https://j1.streams.radiomast.io/fm/j1anime/stream.mp3' },
            { id: 'listen-anime', name: 'Listen.moe Anime', city: 'Online', url: 'https://listen.moe/stream' },
            { id: 'otakufm', name: 'OtakuFM', city: 'Online', url: 'https://stream.otakufm.de/otakufm' },
            { id: 'anison2', name: 'AniSong Radio JP', city: 'Online', url: 'https://stream.zeno.fm/anisong-jp' },
            { id: 'gameost-jp', name: 'Game OST Radio Japan', city: 'Online', url: 'https://stream.laut.fm/gameost' },
          ]},
          { id: 'lofi', name: 'Lo-Fi / Chillout', icon: '🌙', color: '#6366f1', stations: [
            { id: 'j1-lofi', name: 'J1 Lo-Fi Japan', city: 'Online', url: 'https://j1.streams.radiomast.io/fm/j1lofi/stream.mp3' },
            { id: 'nippon-lofi', name: 'Nippon Lo-Fi & Jazz', city: 'Online', url: 'https://stream.laut.fm/japanlofi' },
            { id: 'alpha-station-jp', name: 'Alpha Station FM Kyoto', city: 'Kyoto', url: 'https://stream.zeno.fm/f5l4n5bhsc8uv' },
            { id: 'sakura-lofi', name: 'Sakura Lo-Fi Beats', city: 'Online', url: 'https://stream.zeno.fm/sakuralofi128' },
            { id: 'tokyo-lofi', name: 'Tokyo Lo-Fi (Zeno)', city: 'Tokyo', url: 'https://stream.zeno.fm/tokyo-lofi-beats' },
            { id: 'kyoto-chill', name: 'Kyoto Chillout Radio', city: 'Kyoto', url: 'https://stream.zeno.fm/kyoto-chill-jp' },
          ]},
          { id: 'jrock', name: 'J-Rock / Visual Kei', icon: '🎸', color: '#7c3aed', stations: [
            { id: 'j1-jrock', name: 'J1 Rock Japan', city: 'Online', url: 'https://j1.streams.radiomast.io/fm/j1rock/stream.mp3' },
            { id: 'jrock-laut', name: 'J-Rock Radio (Laut.fm)', city: 'Online', url: 'https://stream.laut.fm/jrock' },
            { id: 'visualkei-jp', name: 'Visual Kei Radio', city: 'Online', url: 'https://stream.zeno.fm/visualkei-japan' },
            { id: 'jmetal-jp', name: 'Japanese Metal Radio', city: 'Online', url: 'https://stream.laut.fm/japanmetal' },
            { id: 'jrock2-zeno', name: 'J-Rock Station (Zeno)', city: 'Online', url: 'https://stream.zeno.fm/jrock-station-jp' },
            { id: 'punk-jp', name: 'Japanese Punk Radio', city: 'Online', url: 'https://stream.zeno.fm/jpunk-radio' },
          ]},
          { id: 'classical', name: 'Classical / Instrumental', icon: '🎻', color: '#0891b2', stations: [
            { id: 'nhk-fm-jp', name: 'NHK-FM (Classical/Culture)', city: 'Tokyo', url: 'https://nhkworldradio.nhk.or.jp/english/media/r_english_mhi128.m3u8' },
            { id: 'classical-jp-laut', name: 'Anime Instrumental (Laut.fm)', city: 'Online', url: 'https://stream.laut.fm/animeinstrumental' },
            { id: 'piano-jp', name: 'Piano Radio Japan', city: 'Online', url: 'https://stream.laut.fm/japanpiano' },
            { id: 'koto-jp', name: 'Traditional Japan Koto/Shakuhachi', city: 'Online', url: 'https://stream.laut.fm/japonaise' },
            { id: 'jazz-jp', name: 'Japanese Jazz Radio', city: 'Tokyo', url: 'https://stream.laut.fm/japanjazz' },
            { id: 'smooth-jp', name: 'Smooth Jazz Japan', city: 'Online', url: 'https://stream.zeno.fm/smooth-jazz-jp' },
          ]},
          { id: 'news', name: 'NHK / Berita', icon: '📰', color: '#64748b', stations: [
            { id: 'nhk-world', name: 'NHK World Radio Japan', city: 'Tokyo', url: 'https://nhkworldradio.nhk.or.jp/english/media/r_english_mhi128.m3u8' },
            { id: 'tbsradio-jp', name: 'TBS Radio 954 kHz', city: 'Tokyo', url: 'https://stream.zeno.fm/tbsradiotokyo' },
            { id: 'joqr-jp', name: 'Bunka Hoso (文化放送)', city: 'Tokyo', url: 'https://stream.zeno.fm/joqr1134' },
            { id: 'interfm-jp', name: 'InterFM 897', city: 'Tokyo', url: 'https://stream.zeno.fm/interfm897' },
            { id: 'nhk-r1-jp', name: 'NHK Radio 1 (日本語)', city: 'Tokyo', url: 'https://stream.zeno.fm/nhkr1japan' },
            { id: 'nhk-r2-jp', name: 'NHK Radio 2 (Education)', city: 'Tokyo', url: 'https://stream.zeno.fm/nhkr2japan' },
          ]},
        ],
      },
      {
        id: 'br', name: 'Brazil', flag: '🇧🇷', color: '#10b981',
        genres: [
          { id: 'samba', name: 'Samba / Pagode', icon: '💃', color: '#f59e0b', stations: [
            { id: 'samba-br', name: 'Rádio Samba BR (Laut.fm)', city: 'Rio de Janeiro', url: 'https://stream.laut.fm/sambabrasileiro' },
            { id: 'pagode-fm', name: 'Pagode FM', city: 'São Paulo', url: 'https://stream.zeno.fm/kfyjrzk2qbzuv' },
            { id: 'bate-ponto', name: 'Bate Ponto FM (Samba/Pagode)', city: 'Rio de Janeiro', url: 'https://stream.zeno.fm/d1p0kf2s9eruv' },
            { id: 'radio-globo-sp', name: 'Rádio Globo SP', city: 'São Paulo', url: 'https://stream.globoradio.globo.com/radio-globo-sp/mp3/256/radio-globo-sp.m3u8' },
            { id: 'sambas-enredo', name: 'Radio Sambas Enredo', city: 'Rio de Janeiro', url: 'https://stream.zeno.fm/4wd2hy7mfkzuv' },
            { id: 'batuque-br', name: 'Rádio Batuque (Samba Clássico)', city: 'Rio de Janeiro', url: 'https://stream.zeno.fm/batuque-samba-br' },
          ]},
          { id: 'axe', name: 'Axé / Forró / Baião', icon: '🎉', color: '#ef4444', stations: [
            { id: 'forro-br', name: 'Forró FM', city: 'Fortaleza', url: 'https://stream.zeno.fm/73htnbsknbzuv' },
            { id: 'axe-bahia', name: 'Rádio Bahia FM (Axé)', city: 'Salvador', url: 'https://stream.zeno.fm/4v0nyrv0zs8uv' },
            { id: 'forro-universitario', name: 'Forró Universitário', city: 'Recife', url: 'https://stream.zeno.fm/8f4fdtbxrxzuv' },
            { id: 'oxente-radio', name: 'Oxente Rádio (Forró/NE)', city: 'Nordeste', url: 'https://stream.zeno.fm/haqbnry3agzuv' },
            { id: 'carnaval-bahia', name: 'Carnaval Bahia Radio', city: 'Salvador', url: 'https://stream.zeno.fm/y3rquvf5m4zuv' },
            { id: 'bahia-fm', name: 'Bahia FM (Axé/Reggae)', city: 'Salvador', url: 'https://stream.zeno.fm/bahiafm-sva' },
          ]},
          { id: 'mpb', name: 'MPB / Bossa Nova', icon: '🎶', color: '#06b6d4', stations: [
            { id: 'bossa-nova', name: 'Bossa Nova Radio (Laut.fm)', city: 'Rio de Janeiro', url: 'https://stream.laut.fm/bossanova' },
            { id: 'mpb-hits', name: 'MPB FM Rio', city: 'Rio de Janeiro', url: 'https://stream.antradio.com.br:8000/mpbfm' },
            { id: 'eldorado-sp', name: 'Rádio Eldorado SP', city: 'São Paulo', url: 'https://stream.eldorado.com.br/eldorado' },
            { id: 'cultura-fm', name: 'Rádio Cultura FM SP', city: 'São Paulo', url: 'https://stream.zeno.fm/3fkcgmfdrfzuv' },
            { id: 'jazz-bossa', name: 'Jazz & Bossa (SomaFM)', city: 'Online', url: 'https://ice1.somafm.com/jazz-128-mp3' },
            { id: 'tropicalia', name: 'Tropicália Radio (MPB Clássica)', city: 'Rio de Janeiro', url: 'https://stream.zeno.fm/tropicalia-mpb' },
          ]},
          { id: 'funk', name: 'Funk Carioca / Hip-Hop BR', icon: '🔊', color: '#8b5cf6', stations: [
            { id: 'funk-br', name: 'Funk Brasil Radio', city: 'Rio de Janeiro', url: 'https://stream.zeno.fm/r7fjrm1zeguv' },
            { id: 'hiphop-br', name: 'Hip-Hop Brasil', city: 'São Paulo', url: 'https://stream.zeno.fm/r0ehn9fxfhzuv' },
            { id: 'funk-ostentacao', name: 'Funk Ostentação', city: 'São Paulo', url: 'https://stream.zeno.fm/mhsyb7t2mkzuv' },
            { id: 'trap-br', name: 'Trap Brasil', city: 'São Paulo', url: 'https://stream.zeno.fm/d1bswdxjt7zuv' },
            { id: 'rap-nacional', name: 'Rap Nacional Brasil', city: 'São Paulo', url: 'https://stream.zeno.fm/4n1d5mvf6bzuv' },
            { id: 'baile-funk', name: 'Baile Funk Rio (Zeno)', city: 'Rio de Janeiro', url: 'https://stream.zeno.fm/baile-funk-rio' },
          ]},
          { id: 'sertanejo', name: 'Sertanejo / Country BR', icon: '🤠', color: '#a16207', stations: [
            { id: 'sertanejo-laut', name: 'Sertanejo Radio (Laut.fm)', city: 'São Paulo', url: 'https://stream.laut.fm/sertanejo' },
            { id: 'sertanejo-zeno', name: 'Sertanejo Universitário', city: 'Goiânia', url: 'https://stream.zeno.fm/sertanejo-univ' },
            { id: 'top-fm-br', name: 'Top FM Sertanejo', city: 'Goiânia', url: 'https://stream.zeno.fm/topfm-sertanejo' },
            { id: 'caipira-br', name: 'Caipira Radio (Viola Caipira)', city: 'Minas Gerais', url: 'https://stream.zeno.fm/caipira-radio-br' },
            { id: 'country-br', name: 'Country Brasil (Linha Rural)', city: 'Goiânia', url: 'https://stream.zeno.fm/country-brasil-go' },
            { id: 'fm-do-povo', name: 'FM do Povo (Sertanejo Clás)', city: 'São Paulo', url: 'https://stream.zeno.fm/fm-do-povo-br' },
          ]},
          { id: 'news', name: 'Notícias / Talk', icon: '📰', color: '#64748b', stations: [
            { id: 'jovem-pan', name: 'Rádio Jovem Pan', city: 'São Paulo', url: 'https://cdnjp.joovip.net.br/joovip_jovempan/JovemPan.mp3' },
            { id: 'band-news', name: 'Band News FM', city: 'São Paulo', url: 'https://stream.zeno.fm/9b18h1x0xtzuv' },
            { id: 'gaucha', name: 'Rádio Gaúcha (GZH)', city: 'Porto Alegre', url: 'https://stream.gaucha.com.br/gaucha' },
            { id: 'cbn-sp', name: 'CBN São Paulo', city: 'São Paulo', url: 'https://stream.zeno.fm/5b6yq08hfhzuv' },
            { id: 'radio-nacional-br', name: 'Rádio Nacional Brasília', city: 'Brasília', url: 'https://radios.ebc.com.br/radio-nacional/icecast.audio' },
            { id: 'metropolis-br', name: 'Metrópolis FM (News Talk)', city: 'Rio de Janeiro', url: 'https://stream.zeno.fm/metropolisfm-rj' },
          ]},
        ],
      },
      {
        id: 'in', name: 'India', flag: '🇮🇳', color: '#f97316',
        genres: [
          { id: 'bollywood', name: 'Bollywood / Hindi Pop', icon: '🎵', color: '#f97316', stations: [
            { id: 'bollywood-laut', name: 'Bollywood Radio (Laut.fm)', city: 'Online', url: 'https://stream.laut.fm/bollywood' },
            { id: 'big-fm', name: 'Big FM 92.7 Delhi', city: 'Delhi', url: 'https://air.pc.cdn.bitgravity.com/air/live/pbaudio013/chunklist.m3u8' },
            { id: 'all-india-radio', name: 'All India Radio Hindi', city: 'Delhi', url: 'https://air.pc.cdn.bitgravity.com/air/live/pbaudio002/chunklist.m3u8' },
            { id: 'air-fm-gold', name: 'AIR FM Gold 106.4', city: 'Delhi', url: 'https://air.pc.cdn.bitgravity.com/air/live/pbaudio003/chunklist.m3u8' },
            { id: 'desi-bollywood', name: 'Desi Bollywood (Zeno)', city: 'Mumbai', url: 'https://stream.zeno.fm/desi-bollywood-in' },
            { id: 'retro-hits-in', name: 'Old is Gold Bollywood', city: 'Online', url: 'https://stream.laut.fm/oldgold' },
          ]},
          { id: 'classical-in', name: 'Classical / Devotional', icon: '🪗', color: '#dc2626', stations: [
            { id: 'air-classical', name: 'AIR National Classical', city: 'Delhi', url: 'https://air.pc.cdn.bitgravity.com/air/live/pbaudio001/chunklist.m3u8' },
            { id: 'bhakti-laut', name: 'Bhakti Radio (Laut.fm)', city: 'Online', url: 'https://stream.laut.fm/bhakti' },
            { id: 'carnatic-laut', name: 'Carnatic Radio (Laut.fm)', city: 'Chennai', url: 'https://stream.laut.fm/carnatic' },
            { id: 'air-carnatic', name: 'AIR Chennai (Carnatic)', city: 'Chennai', url: 'https://air.pc.cdn.bitgravity.com/air/live/pbaudio027/chunklist.m3u8' },
            { id: 'spiritual-zeno', name: 'Spiritual Radio India', city: 'Online', url: 'https://stream.zeno.fm/bqnkq97dqxzuv' },
            { id: 'hindustani-radio', name: 'Hindustani Classical (Zeno)', city: 'Varanasi', url: 'https://stream.zeno.fm/hindustani-classical' },
          ]},
          { id: 'punjabi', name: 'Punjabi / Bhangra', icon: '🥁', color: '#f59e0b', stations: [
            { id: 'punjabi-laut', name: 'Punjabi Radio (Laut.fm)', city: 'Online', url: 'https://stream.laut.fm/punjabi' },
            { id: 'bhangra-laut', name: 'Bhangra Radio (Laut.fm)', city: 'Online', url: 'https://stream.laut.fm/bhangra' },
            { id: 'air-amritsar', name: 'AIR Amritsar', city: 'Amritsar', url: 'https://air.pc.cdn.bitgravity.com/air/live/pbaudio047/chunklist.m3u8' },
            { id: 'punjabi-beats', name: 'Punjabi Beats (Zeno)', city: 'Online', url: 'https://stream.zeno.fm/v0smtd3xt7zuv' },
            { id: 'desi-radio', name: 'Desi Radio UK (Punjabi)', city: 'London', url: 'https://stream.zeno.fm/fnfgq0rdnxzuv' },
            { id: 'punjabi-virsa', name: 'Punjabi Virsa Radio', city: 'Chandigarh', url: 'https://stream.zeno.fm/punjabi-virsa' },
          ]},
          { id: 'tamil-telugu', name: 'Tamil / Telugu / South', icon: '🎶', color: '#0284c7', stations: [
            { id: 'air-chennai', name: 'AIR Chennai FM', city: 'Chennai', url: 'https://air.pc.cdn.bitgravity.com/air/live/pbaudio027/chunklist.m3u8' },
            { id: 'air-hyderabad', name: 'AIR Hyderabad FM', city: 'Hyderabad', url: 'https://air.pc.cdn.bitgravity.com/air/live/pbaudio023/chunklist.m3u8' },
            { id: 'tamil-radio', name: 'Tamil Radio (Laut.fm)', city: 'Chennai', url: 'https://stream.laut.fm/tamilradio' },
            { id: 'kollywood-zeno', name: 'Kollywood Hits (Tamil Film)', city: 'Chennai', url: 'https://stream.zeno.fm/kollywood-hits-in' },
            { id: 'telugu-radio', name: 'Telugu Radio (Zeno)', city: 'Hyderabad', url: 'https://stream.zeno.fm/telugu-radio-hyd' },
            { id: 'rayudu-fm', name: 'Rayudu FM (Telugu Folk)', city: 'Hyderabad', url: 'https://stream.zeno.fm/rayudu-fm-telugu' },
          ]},
          { id: 'electronic-in', name: 'Electronic / Indie IN', icon: '🎧', color: '#8b5cf6', stations: [
            { id: 'indie-in', name: 'Indie Radio India (Zeno)', city: 'Mumbai', url: 'https://stream.zeno.fm/3u6hhtfhfpzuv' },
            { id: 'chill-goa', name: 'Psy Trance / Goa Chill', city: 'Goa', url: 'https://stream.laut.fm/goatrance' },
            { id: 'lounge-in', name: 'India Lounge (Zeno)', city: 'Mumbai', url: 'https://stream.zeno.fm/indialounge128' },
            { id: 'electroindian', name: 'Electronic India (Zeno)', city: 'Online', url: 'https://stream.zeno.fm/azhbv0eafdzuv' },
            { id: 'fusion-in', name: 'Fusion Radio India', city: 'Bangalore', url: 'https://stream.zeno.fm/t9gvqp4kzuzuv' },
            { id: 'goa-trance', name: 'Goa Trance Classics', city: 'Goa', url: 'https://stream.laut.fm/goatrance' },
          ]},
          { id: 'news-in', name: 'News / Talk IN', icon: '📰', color: '#64748b', stations: [
            { id: 'bbc-hindi', name: 'BBC Hindi Service', city: 'London', url: 'https://stream.live.vc.bbcmedia.co.uk/bbc_hindi_news' },
            { id: 'air-news', name: 'All India Radio News', city: 'Delhi', url: 'https://air.pc.cdn.bitgravity.com/air/live/pbaudio002/chunklist.m3u8' },
            { id: 'voa-hindi', name: 'VOA Hindi', city: 'Washington', url: 'https://voa-instreams.akamaized.net/voa/mp3/urdu' },
            { id: 'dw-hindi', name: 'DW Hindi', city: 'Bonn', url: 'https://stream.laut.fm/dwhindi' },
            { id: 'air-fm-rainbow', name: 'AIR FM Rainbow (English)', city: 'Mumbai', url: 'https://air.pc.cdn.bitgravity.com/air/live/pbaudio003/chunklist.m3u8' },
            { id: 'radio-india-news', name: 'Radio India News (Zeno)', city: 'Delhi', url: 'https://stream.zeno.fm/news-india-radio' },
          ]},
        ],
      },
      {
        id: 'mx', name: 'Meksiko', flag: '🇲🇽', color: '#10b981',
        genres: [
          { id: 'pop-mx', name: 'Pop / Reggaeton', icon: '🎵', color: '#10b981', stations: [
            { id: 'exa-fm', name: 'Exa FM 104.9', city: 'México DF', url: 'https://stream.exafm.com/exa-128.mp3' },
            { id: 'ke-buena', name: 'Ke Buena 92.9', city: 'México DF', url: 'https://stream.radioformula.com.mx/kebuena-128.mp3' },
            { id: 'hit-mx', name: 'Hit FM México', city: 'México DF', url: 'https://stream.zeno.fm/5t2g7ywybazuv' },
            { id: 'beats-mx', name: 'Beats Radio MX (Urban)', city: 'México DF', url: 'https://stream.zeno.fm/yxhe8bmt3uzuv' },
            { id: 'reaktor-pop', name: 'Pop & Reggaeton MX (Zeno)', city: 'Guadalajara', url: 'https://stream.zeno.fm/pop-reggaeton-mx' },
            { id: 'estereo-cien', name: 'Estéreo Cien 99.7', city: 'México DF', url: 'https://stream.zeno.fm/estereo-cien-mx' },
          ]},
          { id: 'ranchera', name: 'Ranchera / Mariachi', icon: '🪗', color: '#f59e0b', stations: [
            { id: 'rancheras-laut', name: 'Rancheras (Laut.fm)', city: 'Online', url: 'https://stream.laut.fm/rancheras' },
            { id: 'mariachi-zeno', name: 'Mariachi Radio', city: 'Jalisco', url: 'https://stream.zeno.fm/0q6wdh70e3zuv' },
            { id: 'la-mejor', name: 'La Mejor 97.9 FM', city: 'México DF', url: 'https://stream.zeno.fm/thzqy5v12m8uv' },
            { id: 'el-rey-radio', name: 'El Rey Radio', city: 'México DF', url: 'https://stream.zeno.fm/tpjpqs1y3pzuv' },
            { id: 'w-radio-mx', name: 'W Radio México', city: 'México DF', url: 'https://stream.w-radio.com.mx/w-radio-128.mp3' },
            { id: 'la-z-mx', name: 'La Z Ranchera (Laut.fm)', city: 'Jalisco', url: 'https://stream.laut.fm/lazranchera' },
          ]},
          { id: 'norteno', name: 'Norteño / Banda / Grupero', icon: '🎺', color: '#dc2626', stations: [
            { id: 'norteno-laut', name: 'Norteño Radio (Laut.fm)', city: 'Online', url: 'https://stream.laut.fm/norteno' },
            { id: 'grupero-mx', name: 'Grupero Radio MX', city: 'Monterrey', url: 'https://stream.zeno.fm/n7fqebj49xzuv' },
            { id: 'banda-mx', name: 'Banda FM México', city: 'Guadalajara', url: 'https://stream.zeno.fm/fyb14mpfeszuv' },
            { id: 'que-buena', name: 'Que Buena 93.9', city: 'México DF', url: 'https://stream.zeno.fm/4ykm2zybhszuv' },
            { id: 'rcm-norteno', name: 'RCM Norteño', city: 'Monterrey', url: 'https://stream.zeno.fm/1xv5eycobyzuv' },
            { id: 'corridos-mx', name: 'Corridos Radio México', city: 'Sinaloa', url: 'https://stream.zeno.fm/corridos-radio-mx' },
          ]},
          { id: 'electronic-mx', name: 'Electronic / Dance MX', icon: '🎧', color: '#8b5cf6', stations: [
            { id: 'reactor-mx', name: 'Reactor 105.7 FM', city: 'México DF', url: 'https://stream.zeno.fm/reactor1057mx' },
            { id: 'ibero-mx', name: 'Ibero 90.9 FM (Indie/Alt)', city: 'México DF', url: 'https://stream.zeno.fm/ibero909fmmx' },
            { id: 'wfm-mx', name: 'WFM 96.9 FM (Electronic)', city: 'México DF', url: 'https://stream.zeno.fm/wfm969mx' },
            { id: 'ritmo-mx', name: 'Ritmo 92.9 (Dance/House)', city: 'Guadalajara', url: 'https://stream.zeno.fm/ritmo929mx' },
            { id: 'hitz-mx', name: 'Hitz FM México (EDM)', city: 'Online', url: 'https://stream.zeno.fm/hitzfmmx' },
            { id: 'rave-mx', name: 'Rave Radio México (Techno)', city: 'México DF', url: 'https://stream.zeno.fm/rave-radio-mx' },
          ]},
          { id: 'latin', name: 'Salsa / Latin Jazz / Cumbia', icon: '🎶', color: '#06b6d4', stations: [
            { id: 'salsa-mx', name: 'Salsa Radio México (Laut.fm)', city: 'Online', url: 'https://stream.laut.fm/salsa' },
            { id: 'cumbia-mx', name: 'Cumbia Radio MX', city: 'México DF', url: 'https://stream.zeno.fm/cumbia-mexico' },
            { id: 'tropical-mx', name: 'Radio Tropical México', city: 'Veracruz', url: 'https://stream.zeno.fm/tropical-mx-ver' },
            { id: 'latin-jazz-mx', name: 'Latin Jazz Radio (Laut.fm)', city: 'Online', url: 'https://stream.laut.fm/latinjazz' },
            { id: 'merengue-mx', name: 'Merengue & Bachata MX', city: 'Online', url: 'https://stream.laut.fm/merengue' },
            { id: 'salsa-clasica', name: 'Salsa Clásica Radio', city: 'Online', url: 'https://stream.zeno.fm/salsa-clasica-la' },
          ]},
          { id: 'news-mx', name: 'Noticias / Info MX', icon: '📰', color: '#64748b', stations: [
            { id: 'w-radio-news', name: 'W Radio Noticias', city: 'México DF', url: 'https://stream.w-radio.com.mx/w-radio-128.mp3' },
            { id: 'radio-formula', name: 'Radio Fórmula', city: 'México DF', url: 'https://stream.radioformula.com.mx/formula-128.mp3' },
            { id: 'noticias-mx', name: 'Noticias MVS Radio', city: 'México DF', url: 'https://stream.zeno.fm/oj8tpbwfbhzuv' },
            { id: 'radio-red-mx', name: 'Radio Red 88.1 FM', city: 'México DF', url: 'https://stream.zeno.fm/radiored881mx' },
            { id: 'imagen-radio-mx', name: 'Imagen Radio 90.5', city: 'México DF', url: 'https://stream.zeno.fm/imagen905mx' },
            { id: 'bbc-mundo-mx', name: 'BBC Mundo en Español', city: 'London', url: 'https://stream.live.vc.bbcmedia.co.uk/bbc_mundo_news' },
          ]},
        ],
      },
      {
        id: 'kr', name: 'Korea Selatan', flag: '🇰🇷', color: '#06b6d4',
        genres: [
          { id: 'kpop', name: 'K-Pop / K-R&B', icon: '💫', color: '#06b6d4', stations: [
            { id: 'kpop1', name: 'K-Pop Radio (Laut.fm)', city: 'Online', url: 'https://stream.laut.fm/kpop' },
            { id: 'kpop-hits', name: 'K-Pop Hits Radio (Zeno)', city: 'Online', url: 'https://stream.zeno.fm/gbkda1r5czzuv' },
            { id: 'kbs-cool', name: 'KBS Cool FM (공식)', city: 'Seoul', url: 'https://serpent.kbs.co.kr/mediaproxy/manifest/coolFM/hls/live.m3u8' },
            { id: 'allkpop-radio', name: 'All Kpop Radio', city: 'Online', url: 'https://stream.zeno.fm/ql0hf0meyezuv' },
            { id: 'kpop-mix', name: 'K-Pop Mix Station', city: 'Online', url: 'https://stream.zeno.fm/kpop-mix-station' },
            { id: 'kpop-2nd-gen', name: 'K-Pop 2nd Gen (Zeno)', city: 'Online', url: 'https://stream.zeno.fm/kpop-2nd-gen' },
          ]},
          { id: 'krnb', name: 'K-R&B / Hip-Hop', icon: '🎤', color: '#8b5cf6', stations: [
            { id: 'kr-hiphop', name: 'Korean Hip-Hop (Laut.fm)', city: 'Online', url: 'https://stream.laut.fm/khiphop' },
            { id: 'kr-rnb', name: 'K-R&B Station (Zeno)', city: 'Online', url: 'https://stream.zeno.fm/fgb7t4o2cxzuv' },
            { id: 'idol-radio', name: 'Idol Radio MBC', city: 'Seoul', url: 'https://stream.zeno.fm/pjrdq4nbnmzuv' },
            { id: 'kr-urban', name: 'Korean Urban Radio (Laut.fm)', city: 'Seoul', url: 'https://stream.laut.fm/koreanurban' },
            { id: 'zion-kr', name: 'Zion T Style KRnB', city: 'Seoul', url: 'https://stream.zeno.fm/kr-rnb-smooth' },
            { id: 'kr-trap', name: 'Korean Trap & Hip-Hop', city: 'Seoul', url: 'https://stream.zeno.fm/kr-trap-hiphop' },
          ]},
          { id: 'k-indie', name: 'K-Indie / Alternative', icon: '🎸', color: '#f43f5e', stations: [
            { id: 'k-indie1', name: 'K-Indie Radio (Zeno)', city: 'Seoul', url: 'https://stream.zeno.fm/0r8ydry8cuzuv' },
            { id: 'ebs-radio', name: 'EBS FM (공식)', city: 'Seoul', url: 'https://ebsm3u8.out.myebs.co.kr:8443/streams/ebsfm/ebsfm.m3u8' },
            { id: 'k-rock-zeno', name: 'K-Rock Station (Zeno)', city: 'Busan', url: 'https://stream.zeno.fm/dg08t7n9h0zuv' },
            { id: 'indie-seoul', name: 'Indie Seoul Pop', city: 'Seoul', url: 'https://stream.zeno.fm/wf0bnzd0gjzuv' },
            { id: 'k-shoegaze', name: 'Korean Shoegaze/Indie', city: 'Seoul', url: 'https://stream.zeno.fm/k-shoegaze' },
            { id: 'garage-kr', name: 'Korean Garage Rock (Laut.fm)', city: 'Busan', url: 'https://stream.laut.fm/koreanrock' },
          ]},
          { id: 'trot', name: 'Trot / 트로트', icon: '🎶', color: '#f97316', stations: [
            { id: 'trot-kr', name: 'Trot Radio Korea (Zeno)', city: 'Seoul', url: 'https://stream.zeno.fm/trot-korea' },
            { id: 'trot-laut', name: 'Korean Trot (Laut.fm)', city: 'Online', url: 'https://stream.laut.fm/trot' },
            { id: 'trot-classic', name: 'Trot Classic Station', city: 'Seoul', url: 'https://stream.zeno.fm/trot-classic-kr' },
            { id: 'mr-trot', name: 'Mr. Trot Radio', city: 'Seoul', url: 'https://stream.zeno.fm/mr-trot-kr' },
            { id: 'trot-fm', name: 'Trot FM 24', city: 'Seoul', url: 'https://stream.zeno.fm/trotfm24-kr' },
            { id: 'kbs-2fm', name: 'KBS 2FM (Trot/Pop)', city: 'Seoul', url: 'https://serpent.kbs.co.kr/mediaproxy/manifest/2FM/hls/live.m3u8' },
          ]},
          { id: 'kr-lofi', name: 'Lo-Fi / Chillout KR', icon: '🌙', color: '#6366f1', stations: [
            { id: 'kr-lofi1', name: 'Korean Lofi (Zeno)', city: 'Online', url: 'https://stream.zeno.fm/baq0u5e8nzzuv' },
            { id: 'seoul-chill', name: 'Seoul Chill Beats', city: 'Seoul', url: 'https://stream.zeno.fm/6v2rqbpey7zuv' },
            { id: 'k-jazz', name: 'K-Jazz Radio (Laut.fm)', city: 'Seoul', url: 'https://stream.laut.fm/kjazz' },
            { id: 'han-river', name: 'Han River Lo-Fi', city: 'Seoul', url: 'https://stream.zeno.fm/han-river-lofi' },
            { id: 'study-kr', name: 'Study With Me Korea', city: 'Seoul', url: 'https://stream.zeno.fm/study-kr-beats' },
            { id: 'chill-cafe-kr', name: 'Chill Café Korea', city: 'Seoul', url: 'https://stream.zeno.fm/chill-cafe-kr' },
          ]},
          { id: 'news-kr', name: 'News / Talk KR', icon: '📰', color: '#64748b', stations: [
            { id: 'kbs-world-news', name: 'KBS World Radio', city: 'Seoul', url: 'https://serpent.kbs.co.kr/mediaproxy/manifest/world/hls/live.m3u8' },
            { id: 'ytn-radio', name: 'YTN Radio', city: 'Seoul', url: 'https://stream.zeno.fm/aqr4rp4x3rzuv' },
            { id: 'mbc-news-kr', name: 'MBC Standard FM', city: 'Seoul', url: 'https://stream.zeno.fm/3b06nj0d84zuv' },
            { id: 'tbs-efm', name: 'TBS eFM 101.3 (영어뉴스)', city: 'Seoul', url: 'https://stream.zeno.fm/tbsefm1013' },
            { id: 'arirang-kr', name: 'Arirang Radio (영어 방송)', city: 'Seoul', url: 'https://stream.zeno.fm/arirang-radio-kr' },
            { id: 'sbs-love-fm', name: 'SBS Love FM', city: 'Seoul', url: 'https://stream.zeno.fm/sbs-love-fm-kr' },
          ]},
        ],
      }
    ],
  },
];

// Inline SVG logos for each platform (always reliable, no network dependency)

export const MUSIC_SOURCES = [];

// ── Placeholder supaya SONGS tetap ada
export const _PLACEHOLDER_SONGS = [
  {
    id: 'soundhelix',
    name: 'SoundHelix',
    icon: '🎛️',
    description: 'Synthetic electronic & instrumental',
    color: '#3b82f6',
    songs: [
      { id:'sh1', title:'Deep Space Night',    artist:'SoundHelix', album:'SoundHelix Vol.1',  cover:'https://images.unsplash.com/photo-1464802686167-b939a6910659?w=400&h=400&fit=crop', src:'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',  color:'#3b82f6', bg:'rgba(59,130,246,0.15)',  mood:'calm, expansive, mysterious' },
      { id:'sh2', title:'Lunar Reflection',    artist:'SoundHelix', album:'SoundHelix Vol.2',  cover:'https://images.unsplash.com/photo-1532693322450-2cb5c511067d?w=400&h=400&fit=crop', src:'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',  color:'#a855f7', bg:'rgba(168,85,247,0.15)', mood:'melancholic, bright, reflective' },
      { id:'sh3', title:'Nebula Pulse',         artist:'SoundHelix', album:'SoundHelix Vol.3',  cover:'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=400&h=400&fit=crop', src:'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',  color:'#6366f1', bg:'rgba(99,102,241,0.15)',  mood:'energetic, rhythmic, futuristic' },
      { id:'sh4', title:'Aurora Glow',          artist:'SoundHelix', album:'SoundHelix Vol.4',  cover:'https://images.unsplash.com/photo-1531306728370-e2ebd9d7bb99?w=400&h=400&fit=crop', src:'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',  color:'#14b8a6', bg:'rgba(20,184,166,0.15)',  mood:'uplifting, organic, vibrant' },
      { id:'sh5', title:'Cosmic Drive',         artist:'SoundHelix', album:'SoundHelix Vol.5',  cover:'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=400&h=400&fit=crop', src:'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',  color:'#f59e0b', bg:'rgba(245,158,11,0.15)',  mood:'driving, powerful, intense' },
      { id:'sh6', title:'Starfield Journey',    artist:'SoundHelix', album:'SoundHelix Vol.6',  cover:'https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?w=400&h=400&fit=crop', src:'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',  color:'#ec4899', bg:'rgba(236,72,153,0.15)',  mood:'romantic, dreamy, soft' },
      { id:'sh7', title:'Orbital Drift',        artist:'SoundHelix', album:'SoundHelix Vol.7',  cover:'https://images.unsplash.com/photo-1502134249126-9f3755a50d78?w=400&h=400&fit=crop', src:'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3',  color:'#22c55e', bg:'rgba(34,197,94,0.15)',   mood:'fresh, hopeful, upbeat' },
      { id:'sh8', title:'Midnight Frequency',   artist:'SoundHelix', album:'SoundHelix Vol.8',  cover:'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=400&h=400&fit=crop', src:'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',  color:'#ef4444', bg:'rgba(239,68,68,0.15)',   mood:'energetic, intense, bold' },
      { id:'sh9', title:'Solar Wind',           artist:'SoundHelix', album:'SoundHelix Vol.9',  cover:'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=400&fit=crop', src:'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3',  color:'#0ea5e9', bg:'rgba(14,165,233,0.15)',  mood:'airy, wide, expansive' },
      { id:'sh10',title:'Quantum Echo',         artist:'SoundHelix', album:'SoundHelix Vol.10', cover:'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?w=400&h=400&fit=crop', src:'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3', color:'#8b5cf6', bg:'rgba(139,92,246,0.15)',  mood:'mysterious, deep, immersive' },
      { id:'sh11',title:'Event Horizon',        artist:'SoundHelix', album:'SoundHelix Vol.11', cover:'https://images.unsplash.com/photo-1543722530-d2c3201371e7?w=400&h=400&fit=crop', src:'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3', color:'#f97316', bg:'rgba(249,115,22,0.15)',  mood:'cinematic, grand, epic' },
      { id:'sh12',title:'Hyperspace',           artist:'SoundHelix', album:'SoundHelix Vol.12', cover:'https://images.unsplash.com/photo-1462332420958-a05d1e002413?w=400&h=400&fit=crop', src:'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3', color:'#06b6d4', bg:'rgba(6,182,212,0.15)',   mood:'fast, electrifying, neon' },
      { id:'sh13',title:'Dark Matter',          artist:'SoundHelix', album:'SoundHelix Vol.13', cover:'https://images.unsplash.com/photo-1484589065579-248aad0d8b13?w=400&h=400&fit=crop', src:'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3', color:'#64748b', bg:'rgba(100,116,139,0.15)', mood:'dark, brooding, cinematic' },
      { id:'sh14',title:'Pulsar Rhythm',        artist:'SoundHelix', album:'SoundHelix Vol.14', cover:'https://images.unsplash.com/photo-1531907700752-62799b2a3e84?w=400&h=400&fit=crop', src:'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-14.mp3', color:'#d946ef', bg:'rgba(217,70,239,0.15)',  mood:'groovy, funky, bouncy' },
      { id:'sh15',title:'Void Signal',          artist:'SoundHelix', album:'SoundHelix Vol.15', cover:'https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?w=400&h=400&fit=crop', src:'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3', color:'#10b981', bg:'rgba(16,185,129,0.15)',  mood:'calm, organic, ambient' },
      { id:'sh16',title:'Warp Gate',            artist:'SoundHelix', album:'SoundHelix Vol.16', cover:'https://images.unsplash.com/photo-1516339901601-2e1b62dc0c45?w=400&h=400&fit=crop', src:'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-16.mp3', color:'#3b82f6', bg:'rgba(59,130,246,0.15)',  mood:'energetic, tense, build-up' },
      { id:'sh17',title:'Andromeda Call',       artist:'SoundHelix', album:'SoundHelix Vol.17', cover:'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop', src:'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-17.mp3', color:'#a855f7', bg:'rgba(168,85,247,0.15)', mood:'ethereal, floating, spiritual' },
    ]
  },
  {
    id: 'bensound',
    name: 'Bensound',
    icon: '🎸',
    description: 'Cinematic, jazz & acoustic royalty-free',
    color: '#f59e0b',
    songs: [
      { id:'bs1',  title:'Ukulele',           artist:'Bensound', album:'Acoustic',   cover:'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=400&h=400&fit=crop', src:'https://www.bensound.com/bensound-music/bensound-ukulele.mp3',           color:'#f59e0b', bg:'rgba(245,158,11,0.15)',  mood:'happy, light, playful' },
      { id:'bs2',  title:'Sunny',             artist:'Bensound', album:'Acoustic',   cover:'https://images.unsplash.com/photo-1504898770365-14faca6a7320?w=400&h=400&fit=crop', src:'https://www.bensound.com/bensound-music/bensound-sunny.mp3',             color:'#fbbf24', bg:'rgba(251,191,36,0.15)',  mood:'sunny, cheerful, warm' },
      { id:'bs3',  title:'Acoustic Breeze',   artist:'Bensound', album:'Acoustic',   cover:'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=400&h=400&fit=crop', src:'https://www.bensound.com/bensound-music/bensound-acousticbreeze.mp3',    color:'#22c55e', bg:'rgba(34,197,94,0.15)',   mood:'breeze, peaceful, acoustic' },
      { id:'bs4',  title:'Creative Minds',    artist:'Bensound', album:'Corporate',  cover:'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=400&fit=crop', src:'https://www.bensound.com/bensound-music/bensound-creativeminds.mp3',     color:'#3b82f6', bg:'rgba(59,130,246,0.15)',  mood:'inspiring, motivated, creative' },
      { id:'bs5',  title:'Epic',              artist:'Bensound', album:'Cinematic',  cover:'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&h=400&fit=crop', src:'https://www.bensound.com/bensound-music/bensound-epic.mp3',             color:'#ef4444', bg:'rgba(239,68,68,0.15)',   mood:'epic, powerful, cinematic' },
      { id:'bs6',  title:'Once Again',        artist:'Bensound', album:'Cinematic',  cover:'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=400&h=400&fit=crop', src:'https://www.bensound.com/bensound-music/bensound-onceagain.mp3',        color:'#8b5cf6', bg:'rgba(139,92,246,0.15)',  mood:'reflective, emotional, nostalgic' },
      { id:'bs7',  title:'Jazz Comedy',       artist:'Bensound', album:'Jazz',       cover:'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=400&h=400&fit=crop', src:'https://www.bensound.com/bensound-music/bensound-jazzcomedy.mp3',      color:'#f97316', bg:'rgba(249,115,22,0.15)',  mood:'fun, jazzy, upbeat' },
      { id:'bs8',  title:'Jazzy Frenchy',     artist:'Bensound', album:'Jazz',       cover:'https://images.unsplash.com/photo-1470019693664-1d202d2c0907?w=400&h=400&fit=crop', src:'https://www.bensound.com/bensound-music/bensound-jazzyfrenchy.mp3',    color:'#ec4899', bg:'rgba(236,72,153,0.15)',  mood:'french, romantic, charming' },
      { id:'bs9',  title:'Memories',          artist:'Bensound', album:'Cinematic',  cover:'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=400&h=400&fit=crop', src:'https://www.bensound.com/bensound-music/bensound-memories.mp3',        color:'#14b8a6', bg:'rgba(20,184,166,0.15)',  mood:'nostalgic, tender, beautiful' },
      { id:'bs10', title:'Tenderness',        artist:'Bensound', album:'Romantic',   cover:'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400&h=400&fit=crop', src:'https://www.bensound.com/bensound-music/bensound-tenderness.mp3',      color:'#a855f7', bg:'rgba(168,85,247,0.15)', mood:'soft, tender, intimate' },
      { id:'bs11', title:'Relaxing',          artist:'Bensound', album:'Ambient',    cover:'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=400&fit=crop', src:'https://www.bensound.com/bensound-music/bensound-relaxing.mp3',        color:'#06b6d4', bg:'rgba(6,182,212,0.15)',   mood:'calm, relaxing, serene' },
      { id:'bs12', title:'Cute',              artist:'Bensound', album:'Acoustic',   cover:'https://images.unsplash.com/photo-1490750967868-88df5691cc8b?w=400&h=400&fit=crop', src:'https://www.bensound.com/bensound-music/bensound-cute.mp3',             color:'#f43f5e', bg:'rgba(244,63,94,0.15)',   mood:'cute, sweet, positive' },
    ]
  },
  {
    id: 'musopen',
    name: 'Musopen',
    icon: '🎻',
    description: 'Klasik & orkestra bebas hak cipta',
    color: '#8b5cf6',
    songs: [
      { id:'mo1', title:'Moonlight Sonata Mvt.1',   artist:'Beethoven',   album:'Piano Sonatas',      cover:'https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=400&h=400&fit=crop', src:'https://musopen.org/music/download/1326/', color:'#8b5cf6', bg:'rgba(139,92,246,0.15)',  mood:'melancholic, contemplative, moonlit' },
      { id:'mo2', title:'Für Elise',                artist:'Beethoven',   album:'Bagatelles',         cover:'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=400&h=400&fit=crop', src:'https://musopen.org/music/download/219/',  color:'#a855f7', bg:'rgba(168,85,247,0.15)', mood:'delicate, flowing, classical' },
      { id:'mo3', title:'Clair de Lune',             artist:'Debussy',     album:'Suite Bergamasque',  cover:'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop', src:'https://musopen.org/music/download/734/',  color:'#06b6d4', bg:'rgba(6,182,212,0.15)',   mood:'dreamy, impressionist, moonlight' },
      { id:'mo4', title:'Canon in D',               artist:'Pachelbel',   album:'Chamber Music',      cover:'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=400&h=400&fit=crop', src:'https://musopen.org/music/download/878/',  color:'#f59e0b', bg:'rgba(245,158,11,0.15)',  mood:'elegant, timeless, ceremonial' },
      { id:'mo5', title:'Symphony No.5 Mvt.1',      artist:'Beethoven',   album:'Symphonies',         cover:'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400&h=400&fit=crop', src:'https://musopen.org/music/download/587/',  color:'#ef4444', bg:'rgba(239,68,68,0.15)',   mood:'dramatic, powerful, triumphant' },
      { id:'mo6', title:'The Four Seasons - Spring', artist:'Vivaldi',     album:'The Four Seasons',   cover:'https://images.unsplash.com/photo-1490750967868-88df5691cc8b?w=400&h=400&fit=crop', src:'https://musopen.org/music/download/2864/', color:'#22c55e', bg:'rgba(34,197,94,0.15)',   mood:'joyful, vibrant, seasonal' },
      { id:'mo7', title:'Gymnopédie No.1',           artist:'Erik Satie',  album:'Gymnopédies',        cover:'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=400&h=400&fit=crop', src:'https://musopen.org/music/download/1241/', color:'#14b8a6', bg:'rgba(20,184,166,0.15)',  mood:'slow, peaceful, introspective' },
      { id:'mo8', title:'Waltz of the Snowflakes',   artist:'Tchaikovsky', album:'The Nutcracker',     cover:'https://images.unsplash.com/photo-1544511916-0148ccdeb877?w=400&h=400&fit=crop', src:'https://musopen.org/music/download/2212/', color:'#0ea5e9', bg:'rgba(14,165,233,0.15)',  mood:'magical, whimsical, festive' },
    ]
  },
  {
    id: 'pixabay',
    name: 'Pixabay Music',
    icon: '🎧',
    description: 'Lo-fi, chill & electronic beats',
    color: '#ec4899',
    songs: [
      { id:'px1',  title:'Lofi Study',           artist:'Pixabay', album:'Lo-Fi Chill',  cover:'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=400&fit=crop', src:'https://cdn.pixabay.com/audio/2022/05/27/audio_1808fbf07a.mp3', color:'#ec4899', bg:'rgba(236,72,153,0.15)',  mood:'focus, calm, study' },
      { id:'px2',  title:'Ambient Piano',         artist:'Pixabay', album:'Ambient',      cover:'https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=400&h=400&fit=crop', src:'https://cdn.pixabay.com/audio/2022/01/18/audio_d0c6ff1fbe.mp3', color:'#8b5cf6', bg:'rgba(139,92,246,0.15)',  mood:'ambient, peaceful, reflective' },
      { id:'px3',  title:'Chill Hip Hop Beat',    artist:'Pixabay', album:'Hip-Hop',      cover:'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop', src:'https://cdn.pixabay.com/audio/2022/03/15/audio_9b3d8ca61a.mp3', color:'#f97316', bg:'rgba(249,115,22,0.15)',  mood:'chill, urban, laid-back' },
      { id:'px4',  title:'Corporate Upbeat',      artist:'Pixabay', album:'Corporate',    cover:'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=400&fit=crop', src:'https://cdn.pixabay.com/audio/2022/08/04/audio_2dde668d05.mp3', color:'#3b82f6', bg:'rgba(59,130,246,0.15)',  mood:'energetic, professional, upbeat' },
      { id:'px5',  title:'Acoustic Guitar Folk',  artist:'Pixabay', album:'Acoustic',     cover:'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=400&h=400&fit=crop', src:'https://cdn.pixabay.com/audio/2022/03/10/audio_270f49c370.mp3', color:'#22c55e', bg:'rgba(34,197,94,0.15)',   mood:'natural, warm, campfire' },
      { id:'px6',  title:'Cinematic Adventure',   artist:'Pixabay', album:'Cinematic',    cover:'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&h=400&fit=crop', src:'https://cdn.pixabay.com/audio/2022/10/16/audio_f8cef61ac1.mp3', color:'#ef4444', bg:'rgba(239,68,68,0.15)',   mood:'adventure, cinematic, heroic' },
      { id:'px7',  title:'Tropical House Vibes',  artist:'Pixabay', album:'Electronic',   cover:'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=400&fit=crop', src:'https://cdn.pixabay.com/audio/2022/08/31/audio_2f79e5f0ba.mp3', color:'#14b8a6', bg:'rgba(20,184,166,0.15)',  mood:'tropical, summer, fresh' },
      { id:'px8',  title:'Deep Electronic',       artist:'Pixabay', album:'Electronic',   cover:'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop', src:'https://cdn.pixabay.com/audio/2022/07/25/audio_ba1e4c90af.mp3', color:'#06b6d4', bg:'rgba(6,182,212,0.15)',   mood:'deep, electronic, nightclub' },
      { id:'px9',  title:'Inspiring Morning',     artist:'Pixabay', album:'Motivational', cover:'https://images.unsplash.com/photo-1504898770365-14faca6a7320?w=400&h=400&fit=crop', src:'https://cdn.pixabay.com/audio/2022/10/25/audio_2a5e65caaa.mp3', color:'#fbbf24', bg:'rgba(251,191,36,0.15)',  mood:'inspiring, morning, fresh start' },
      { id:'px10', title:'Sad Piano',             artist:'Pixabay', album:'Emotional',    cover:'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=400&h=400&fit=crop', src:'https://cdn.pixabay.com/audio/2022/10/25/audio_c21f3d8049.mp3', color:'#64748b', bg:'rgba(100,116,139,0.15)', mood:'sad, emotional, introspective' },
    ]
  },
  {
    id: 'incompetech',
    name: 'Incompetech',
    icon: '🎺',
    description: 'Kevin MacLeod — ratusan genre bebas',
    color: '#14b8a6',
    songs: [
      { id:'km1',  title:'Cipher',               artist:'Kevin MacLeod', album:'Electronic',  cover:'https://images.unsplash.com/photo-1462331420958-a05d1e002413?w=400&h=400&fit=crop', src:'https://incompetech.com/music/royalty-free/mp3-royaltyfree/Cipher.mp3',               color:'#14b8a6', bg:'rgba(20,184,166,0.15)',  mood:'mysterious, electronic, dark' },
      { id:'km2',  title:'Cephalopod',            artist:'Kevin MacLeod', album:'Ambient',     cover:'https://images.unsplash.com/photo-1484589065579-248aad0d8b13?w=400&h=400&fit=crop', src:'https://incompetech.com/music/royalty-free/mp3-royaltyfree/Cephalopod.mp3',            color:'#0ea5e9', bg:'rgba(14,165,233,0.15)',  mood:'floating, underwater, ambient' },
      { id:'km3',  title:'Sneaky Snitch',         artist:'Kevin MacLeod', album:'Comedy',      cover:'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=400&h=400&fit=crop', src:'https://incompetech.com/music/royalty-free/mp3-royaltyfree/Sneaky%20Snitch.mp3',       color:'#f97316', bg:'rgba(249,115,22,0.15)',  mood:'sneaky, jazzy, comedic' },
      { id:'km4',  title:'Scheming Weasel',       artist:'Kevin MacLeod', album:'Comedy',      cover:'https://images.unsplash.com/photo-1470019693664-1d202d2c0907?w=400&h=400&fit=crop', src:'https://incompetech.com/music/royalty-free/mp3-royaltyfree/Scheming%20Weasel.mp3',     color:'#ec4899', bg:'rgba(236,72,153,0.15)',  mood:'cartoonish, playful, mischievous' },
      { id:'km5',  title:'Intended Force',        artist:'Kevin MacLeod', album:'Cinematic',   cover:'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400&h=400&fit=crop', src:'https://incompetech.com/music/royalty-free/mp3-royaltyfree/Intended%20Force.mp3',      color:'#ef4444', bg:'rgba(239,68,68,0.15)',   mood:'epic, forceful, action' },
      { id:'km6',  title:'Hyperfun',              artist:'Kevin MacLeod', album:'Electronic',  cover:'https://images.unsplash.com/photo-1416339134316-0e91dc9ded92?w=400&h=400&fit=crop', src:'https://incompetech.com/music/royalty-free/mp3-royaltyfree/Hyperfun.mp3',              color:'#a855f7', bg:'rgba(168,85,247,0.15)', mood:'upbeat, silly, hyper' },
      { id:'km7',  title:'Hitman',                artist:'Kevin MacLeod', album:'Electronic',  cover:'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=400&h=400&fit=crop', src:'https://incompetech.com/music/royalty-free/mp3-royaltyfree/Hitman.mp3',                color:'#64748b', bg:'rgba(100,116,139,0.15)', mood:'dark, tense, thriller' },
      { id:'km8',  title:'Local Forecast',        artist:'Kevin MacLeod', album:'Jazz',        cover:'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=400&h=400&fit=crop', src:'https://incompetech.com/music/royalty-free/mp3-royaltyfree/Local%20Forecast.mp3',     color:'#22c55e', bg:'rgba(34,197,94,0.15)',   mood:'easy, breezy, morning news' },
      { id:'km9',  title:'Pixel Peeker Polka',    artist:'Kevin MacLeod', album:'Folk',        cover:'https://images.unsplash.com/photo-1526478806334-5fd488fcaabc?w=400&h=400&fit=crop', src:'https://incompetech.com/music/royalty-free/mp3-royaltyfree/Pixel%20Peeker%20Polka%20-%20slower.mp3', color:'#fbbf24', bg:'rgba(251,191,36,0.15)', mood:'folk, bouncy, fun' },
    ]
  },
];

// Default placeholder track — ditampilkan sebelum lagu dari Drive/lokal diputar
export const SONGS = [
  {
    id: 'placeholder',
    title: 'Pilih Lagu',
    artist: 'Cari di platform streaming atau upload dari Drive',
    album: '',
    cover: 'https://images.unsplash.com/photo-1464802686167-b939a6910659?w=400&h=400&fit=crop',
    src: '',
    color: '#3b82f6',
    bg: 'rgba(59,130,246,0.15)',
    mood: '',
  }
];

// ── Built-in songs (empty — all music comes from external platforms/Drive)
export const builtinSongs = [];

// Helper: semua lagu dari semua sumber yang sudah di-load
// ═══════════════════════════════════════════════════════
//  GOOGLE DRIVE
// ═══════════════════════════════════════════════════════
export const GOOGLE_CLIENT_ID = '1028346781018-vbeafem60jrt8ctu1k1q07pfk41ejlnn.apps.googleusercontent.com';
export const GOOGLE_SCOPES    = 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.readonly profile email';
export const DRIVE_FOLDER     = 'Starry Night Music';
export const SONG_COLORS = [
  { color:'#3b82f6', bg:'rgba(59,130,246,0.15)' },  { color:'#a855f7', bg:'rgba(168,85,247,0.15)' },
  { color:'#6366f1', bg:'rgba(99,102,241,0.15)' },  { color:'#14b8a6', bg:'rgba(20,184,166,0.15)' },
  { color:'#f59e0b', bg:'rgba(245,158,11,0.15)' },  { color:'#ec4899', bg:'rgba(236,72,153,0.15)' },
  { color:'#22c55e', bg:'rgba(34,197,94,0.15)' },   { color:'#ef4444', bg:'rgba(239,68,68,0.15)' },
];
export const COVERS = [
  'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop',
];
export const randItem = arr => arr[Math.floor(Math.random() * arr.length)];

export const SLEEP_OPTIONS = [
  { label:'5 menit',  min:5  },
  { label:'10 menit', min:10 },
  { label:'15 menit', min:15 },
  { label:'30 menit', min:30 },
  { label:'45 menit', min:45 },
  { label:'1 jam',    min:60 },
];

// ═══════════════════════════════════════════════════════
//  AI — Multi-provider: OpenRouter, Gemini, Groq
// ═══════════════════════════════════════════════════════

// Public Piped/Invidious API instances (YouTube search, no key needed)
// /api/invidious and /api/piped are Vercel Serverless Functions that proxy
// requests server-side — no CORS issues, tries multiple upstream instances automatically.
export const PIPED_INSTANCES = [
  '/api/piped',                 // Vercel serverless function (primary, no CORS)
  'https://pipedapi.kavin.rocks',
  'https://pipedapi.tokhmi.xyz',
  'https://pipedapi.moomoo.me',
];
export const INVIDIOUS_INSTANCES = [
  '/api/invidious',             // Vercel serverless function (primary, no CORS)
  'https://inv.tux.pizza',
  'https://invidious.privacyredirect.com',
  'https://invidious.nerdvpn.de',
];

// ── URL builder helpers for Invidious and Piped
// When base is our serverless proxy ('/api/invidious' or '/api/piped'),
// the API path goes into a ?path= query parameter.
// When base is an external URL, the path is appended directly.
export function buildInvidiousUrl(base, apiPath, params = {}) {
  if (base.startsWith('/')) {
    const qs = new URLSearchParams({ path: apiPath, ...params }).toString();
    return `${base}?${qs}`;
  }
  const qs = new URLSearchParams(params).toString();
  return `${base}${apiPath}${qs ? '?' + qs : ''}`;
}
export function buildPipedUrl(base, apiPath, params = {}) {
  if (base.startsWith('/')) {
    const qs = new URLSearchParams({ path: apiPath, ...params }).toString();
    return `${base}?${qs}`;
  }
  const qs = new URLSearchParams(params).toString();
  return `${base}${apiPath}${qs ? '?' + qs : ''}`;
}

// ── Provider definitions
// PROVIDERS built lazily to avoid window.location access at module init time
export function getProviders() {
  const origin = (typeof window !== 'undefined' && window.location?.origin) || '';
  const userKey = getUserAiKey();
  return [
    // ── User-supplied AI key (highest priority) — auto-detect provider
    ...(userKey && userKey.length > 10 ? (() => {
      if (userKey.startsWith('sk-or-')) return [
        { provider:'OpenRouter', key:userKey, model:'deepseek/deepseek-chat:free', endpoint:'https://openrouter.ai/api/v1/chat/completions', isOpenAI:true, extra:{ 'HTTP-Referer':origin,'X-Title':'Starry Night' } },
        { provider:'OpenRouter', key:userKey, model:'meta-llama/llama-3.3-70b-instruct:free',    endpoint:'https://openrouter.ai/api/v1/chat/completions', isOpenAI:true, extra:{ 'HTTP-Referer':origin,'X-Title':'Starry Night' } },
      ];
      if (userKey.startsWith('sk-ant-')) return [
        { provider:'Claude', key:userKey, model:'claude-haiku-4-5-20251001', endpoint:'https://api.anthropic.com/v1/messages', isOpenAI:false, extra:{ 'anthropic-version':'2023-06-01','anthropic-dangerous-direct-browser-access':'true' } },
      ];
      if (userKey.startsWith('gsk_')) return [
        { provider:'Groq', key:userKey, model:'llama-3.3-70b-versatile', endpoint:'https://api.groq.com/openai/v1/chat/completions', isOpenAI:true, extra:{} },
        { provider:'Groq', key:userKey, model:'llama3-8b-8192',          endpoint:'https://api.groq.com/openai/v1/chat/completions', isOpenAI:true, extra:{} },
      ];
      if (userKey.startsWith('AIza')) return [
        { provider:'Gemini', key:userKey, model:'gemini-2.0-flash', endpoint:'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions', isOpenAI:true, extra:{} },
      ];
      if (userKey.startsWith('xai-')) return [
        { provider:'Grok', key:userKey, model:'grok-3',      endpoint:'https://api.x.ai/v1/chat/completions', isOpenAI:true, extra:{} },
        { provider:'Grok', key:userKey, model:'grok-3-mini', endpoint:'https://api.x.ai/v1/chat/completions', isOpenAI:true, extra:{} },
      ];
      if (userKey.startsWith('hf_')) return [
        { provider:'HuggingFace', key:userKey, model:'meta-llama/Llama-3.3-70B-Instruct', endpoint:'https://router.huggingface.co/v1/chat/completions', isOpenAI:true, extra:{} },
        { provider:'HuggingFace', key:userKey, model:'Qwen/Qwen2.5-72B-Instruct',         endpoint:'https://router.huggingface.co/v1/chat/completions', isOpenAI:true, extra:{} },
      ];
      if (userKey.startsWith('ghp_') || userKey.startsWith('github_pat_')) return [
        { provider:'GitHub', key:userKey, model:'gpt-4o-mini',              endpoint:'https://models.inference.ai.azure.com/chat/completions', isOpenAI:true, extra:{} },
        { provider:'GitHub', key:userKey, model:'meta-llama-3.3-70b-instruct', endpoint:'https://models.inference.ai.azure.com/chat/completions', isOpenAI:true, extra:{} },
      ];
      if (userKey.startsWith('sk-') && !userKey.startsWith('sk-or-')) {
        // OpenAI and DeepSeek share the sk- prefix — include both so the
        // round-robin / race logic can try whichever actually accepts the key.
        return [
          { provider:'OpenAI',   key:userKey, model:'gpt-4o-mini',        endpoint:'https://api.openai.com/v1/chat/completions', isOpenAI:true, extra:{} },
          { provider:'OpenAI',   key:userKey, model:'gpt-4o',             endpoint:'https://api.openai.com/v1/chat/completions', isOpenAI:true, extra:{} },
          { provider:'DeepSeek', key:userKey, model:'deepseek-chat',      endpoint:'https://api.deepseek.com/v1/chat/completions', isOpenAI:true, extra:{} },
          { provider:'DeepSeek', key:userKey, model:'deepseek-reasoner',  endpoint:'https://api.deepseek.com/v1/chat/completions', isOpenAI:true, extra:{} },
        ];
      }
      // Unknown format — try as OpenRouter
      return [{ provider:'OpenRouter', key:userKey, model:'deepseek/deepseek-chat:free', endpoint:'https://openrouter.ai/api/v1/chat/completions', isOpenAI:true, extra:{ 'HTTP-Referer':origin,'X-Title':'Starry Night' } }];
    })() : []),
    // OpenAI — via /api/openai server-side proxy (OPENAI_API_KEY in Vercel env vars, never in browser)
    { provider:'OpenAI', key:'__proxy__', model:'gpt-4o-mini',   endpoint:'/api/openai', isOpenAI:true, extra:{} },
    { provider:'OpenAI', key:'__proxy__', model:'gpt-4o',         endpoint:'/api/openai', isOpenAI:true, extra:{} },
    { provider:'OpenAI', key:'__proxy__', model:'gpt-3.5-turbo', endpoint:'/api/openai', isOpenAI:true, extra:{} },
    // Anthropic — /api/anthropic proxy (ANTHROPIC_API_KEY di Vercel env, tidak pernah ke browser)
    { provider:'Claude', key:'__proxy__', model:'claude-haiku-4-5-20251001', endpoint:'/api/anthropic', isOpenAI:false, extra:{} },
    { provider:'Claude', key:'__proxy__', model:'claude-sonnet-4-6',         endpoint:'/api/anthropic', isOpenAI:false, extra:{} },
    // OpenRouter — /api/openrouter proxy (OPENROUTER_API_KEY di Vercel env, tidak pernah ke browser)
    { provider:'OpenRouter', key:'__proxy__', model:'deepseek/deepseek-chat:free',            endpoint:'/api/openrouter', isOpenAI:true, extra:{} },
    { provider:'OpenRouter', key:'__proxy__', model:'meta-llama/llama-3.3-70b-instruct:free', endpoint:'/api/openrouter', isOpenAI:true, extra:{} },
    { provider:'OpenRouter', key:'__proxy__', model:'qwen/qwen3-8b:free',                     endpoint:'/api/openrouter', isOpenAI:true, extra:{} },
    { provider:'OpenRouter', key:'__proxy__', model:'google/gemma-3-27b-it:free',             endpoint:'/api/openrouter', isOpenAI:true, extra:{} },
    // Gemini — /api/gemini proxy (GEMINI_API_KEY di Vercel env, tidak pernah ke browser)
    { provider:'Gemini', key:'__proxy__', model:'gemini-2.0-flash', endpoint:'/api/gemini', isOpenAI:true, extra:{} },
    { provider:'Gemini', key:'__proxy__', model:'gemini-1.5-flash', endpoint:'/api/gemini', isOpenAI:true, extra:{} },
    // Groq — /api/groq proxy (GROQ_API_KEY di Vercel env, tidak pernah ke browser)
    { provider:'Groq', key:'__proxy__', model:'llama-3.3-70b-versatile', endpoint:'/api/groq', isOpenAI:true, extra:{} },
    { provider:'Groq', key:'__proxy__', model:'gemma2-9b-it',            endpoint:'/api/groq', isOpenAI:true, extra:{} },
    { provider:'Groq', key:'__proxy__', model:'llama3-8b-8192',          endpoint:'/api/groq', isOpenAI:true, extra:{} },
    // DeepSeek — /api/deepseek proxy (DEEPSEEK_API_KEY di Vercel env, tidak pernah ke browser)
    { provider:'DeepSeek', key:'__proxy__', model:'deepseek-chat',     endpoint:'/api/deepseek', isOpenAI:true, extra:{} },
    { provider:'DeepSeek', key:'__proxy__', model:'deepseek-reasoner', endpoint:'/api/deepseek', isOpenAI:true, extra:{} },
    // Grok (xAI) — /api/grok proxy (GROK_API_KEY di Vercel env, tidak pernah ke browser)
    { provider:'Grok', key:'__proxy__', model:'grok-3',      endpoint:'/api/grok', isOpenAI:true, extra:{} },
    { provider:'Grok', key:'__proxy__', model:'grok-3-mini', endpoint:'/api/grok', isOpenAI:true, extra:{} },
    // HuggingFace — hf_ key via sn_ai_key handled above; here only legacy sn_hf_key or proxy fallback
    ...((() => {
      if (userKey && userKey.startsWith('hf_')) return []; // already handled in user-key block
      const k = getUserHfKey(); // legacy sn_hf_key fallback
      if (k && k.length > 10) return [
        { provider:'HuggingFace', key:k, model:'meta-llama/Llama-3.3-70B-Instruct', endpoint:'https://router.huggingface.co/v1/chat/completions', isOpenAI:true, extra:{} },
        { provider:'HuggingFace', key:k, model:'Qwen/Qwen2.5-72B-Instruct',         endpoint:'https://router.huggingface.co/v1/chat/completions', isOpenAI:true, extra:{} },
        { provider:'HuggingFace', key:k, model:'mistralai/Mistral-7B-Instruct-v0.3', endpoint:'https://router.huggingface.co/v1/chat/completions', isOpenAI:true, extra:{} },
      ];
      return [
        { provider:'HuggingFace', key:'__proxy__', model:'meta-llama/Llama-3.3-70B-Instruct', endpoint:'/api/huggingface', isOpenAI:true, extra:{} },
        { provider:'HuggingFace', key:'__proxy__', model:'Qwen/Qwen2.5-72B-Instruct',         endpoint:'/api/huggingface', isOpenAI:true, extra:{} },
      ];
    })()),
    // Cloudflare Workers AI — user key direct OR via /api/cloudflare server-side proxy
    ...((() => {
      const k = getUserCfKey();
      if (k && k.length > 10) {
        // Cloudflare user keys need account_id too — only proxy mode supported for direct calls
        // If user provides key in format "accountId:apiKey" we parse it, else use proxy
        const parts = k.split(':');
        if (parts.length === 2) {
          const [acctId, cfKey] = parts;
          const cfBase = `https://api.cloudflare.com/client/v4/accounts/${acctId}/ai/v1/chat/completions`;
          return [
            { provider:'Cloudflare', key:cfKey, model:'@cf/meta/llama-3.3-70b-instruct-fp8-fast', endpoint:cfBase, isOpenAI:true, extra:{} },
            { provider:'Cloudflare', key:cfKey, model:'@cf/qwen/qwen2.5-72b-instruct',             endpoint:cfBase, isOpenAI:true, extra:{} },
          ];
        }
      }
      return [
        { provider:'Cloudflare', key:'__proxy__', model:'@cf/meta/llama-3.3-70b-instruct-fp8-fast', endpoint:'/api/cloudflare', isOpenAI:true, extra:{} },
        { provider:'Cloudflare', key:'__proxy__', model:'@cf/qwen/qwen2.5-72b-instruct',             endpoint:'/api/cloudflare', isOpenAI:true, extra:{} },
      ];
    })()),
    // GitHub Models — user key only (ghp_/github_pat_ via sn_ai_key or legacy sn_gh_key); no server proxy
    ...((() => {
      if (userKey && (userKey.startsWith('ghp_') || userKey.startsWith('github_pat_'))) return []; // already handled above
      const k = getUserGhKey(); // legacy sn_gh_key fallback
      if (k && k.length > 10) return [
        { provider:'GitHub', key:k, model:'gpt-4o-mini',                 endpoint:'https://models.inference.ai.azure.com/chat/completions', isOpenAI:true, extra:{} },
        { provider:'GitHub', key:k, model:'meta-llama-3.3-70b-instruct', endpoint:'https://models.inference.ai.azure.com/chat/completions', isOpenAI:true, extra:{} },
        { provider:'GitHub', key:k, model:'Phi-4',                       endpoint:'https://models.inference.ai.azure.com/chat/completions', isOpenAI:true, extra:{} },
      ];
      return []; // no proxy available
    })()),
    // SambaNova Cloud — user key only (sn_sn_key); no server proxy
    ...((() => {
      const k = getUserSnKey();
      if (k && k.length > 10) return [
        { provider:'SambaNova', key:k, model:'Meta-Llama-3.3-70B-Instruct', endpoint:'https://api.sambanova.ai/v1/chat/completions', isOpenAI:true, extra:{} },
        { provider:'SambaNova', key:k, model:'Qwen2.5-72B-Instruct',        endpoint:'https://api.sambanova.ai/v1/chat/completions', isOpenAI:true, extra:{} },
        { provider:'SambaNova', key:k, model:'DeepSeek-R1',                 endpoint:'https://api.sambanova.ai/v1/chat/completions', isOpenAI:true, extra:{} },
      ];
      return []; // no proxy available
    })()),
    // ── EXTERNAL FALLBACK (no key required — public free endpoints)
    // Digunakan otomatis jika SEMUA provider di atas gagal / sibuk
    // Pollinations AI — free, no key, OpenAI-compatible
    { provider:'Pollinations', key:'__nokey__', model:'openai', endpoint:'https://text.pollinations.ai/openai', isOpenAI:true, extra:{ 'Referer':'https://starrynight.app' } },
    { provider:'Pollinations', key:'__nokey__', model:'mistral', endpoint:'https://text.pollinations.ai/openai', isOpenAI:true, extra:{ 'Referer':'https://starrynight.app' } },
    { provider:'Pollinations', key:'__nokey__', model:'llama', endpoint:'https://text.pollinations.ai/openai', isOpenAI:true, extra:{ 'Referer':'https://starrynight.app' } },
  ];
}

let slotIdx = 0;

// ═══════════════════════════════════════════════════════
//  USER RUNTIME API KEYS — diisi dari Settings > API Keys
//  User key diutamakan; fallback ke env/built-in jika kosong
// ═══════════════════════════════════════════════════════
const _ENV_SP_ID     = ''; // handled via /api/spotify-token server proxy
const _ENV_SP_SECRET = ''; // handled via /api/spotify-token server proxy
const _ENV_SC_ID     = ''; // user supplies via Settings; server key via /api/soundcloud proxy
// DeepSeek & Grok keys are now handled server-side in /api/deepseek and /api/grok
const _ENV_DS_KEY    = ''; // unused — key lives in Vercel env var DEEPSEEK_API_KEY
const _ENV_GROK_KEY  = ''; // unused — key lives in Vercel env var GROK_API_KEY
// YouTube Data API v3 — bisa via env (server proxy) ATAU user key langsung dari browser
const _ENV_YT_KEY = ''; // user supplies via Settings — env key would be VITE_ (client) so removed
// Runtime mutable — diupdate oleh App saat settings berubah
let _USER_SP_ID     = '';
let _USER_SP_SECRET = '';
let _USER_SC_ID     = '';
let _USER_AI_KEY    = ''; // Universal AI key — auto-detect provider from prefix
let _USER_YT_KEY    = ''; // YouTube Data API v3 key dari user
let _USER_HF_KEY    = ''; // HuggingFace Inference API key (hf_...)
let _USER_CF_KEY    = ''; // Cloudflare Workers AI key
let _USER_GH_KEY    = ''; // GitHub Models token (ghp_... or github_pat_...)
let _USER_SN_KEY    = ''; // SambaNova Cloud API key
export const setRuntimeKeys = (sp_id, sp_secret, sc_id, ai_key, _u1, _u2, yt_key, hf_key, cf_key, gh_key, sn_key) => {
  _USER_SP_ID = sp_id || ''; _USER_SP_SECRET = sp_secret || '';
  _USER_SC_ID = sc_id || ''; _USER_AI_KEY    = ai_key    || '';
  _USER_YT_KEY = yt_key || '';
  _USER_HF_KEY = hf_key || '';
  _USER_CF_KEY = cf_key || '';
  _USER_GH_KEY = gh_key || '';
  _USER_SN_KEY = sn_key || '';
  _spToken = null; _spTokenExp = 0;
};
export const getSpId      = () => _USER_SP_ID     || _ENV_SP_ID;
export const getSpSecret  = () => _USER_SP_SECRET || _ENV_SP_SECRET;
export const getScId      = () => _USER_SC_ID     || _ENV_SC_ID;
export const getUserAiKey  = () => _USER_AI_KEY || (typeof localStorage !== 'undefined' ? localStorage.getItem('sn_ai_key') || '' : '');
export const getUserDsKey  = () => _ENV_DS_KEY;
export const getUserGrokKey = () => _ENV_GROK_KEY;
export const getUserHfKey  = () => {
  if (_USER_HF_KEY) return _USER_HF_KEY;
  const aiKey = typeof localStorage !== 'undefined' ? localStorage.getItem('sn_ai_key') || '' : '';
  if (aiKey.startsWith('hf_')) return aiKey;
  return typeof localStorage !== 'undefined' ? localStorage.getItem('sn_hf_key') || '' : '';
};
export const getUserCfKey  = () => _USER_CF_KEY || (typeof localStorage !== 'undefined' ? localStorage.getItem('sn_cf_key') || '' : '');
export const getUserGhKey  = () => {
  if (_USER_GH_KEY) return _USER_GH_KEY;
  const aiKey = typeof localStorage !== 'undefined' ? localStorage.getItem('sn_ai_key') || '' : '';
  if (aiKey.startsWith('ghp_') || aiKey.startsWith('github_pat_')) return aiKey;
  return typeof localStorage !== 'undefined' ? localStorage.getItem('sn_gh_key') || '' : '';
};
export const getUserSnKey  = () => _USER_SN_KEY || (typeof localStorage !== 'undefined' ? localStorage.getItem('sn_sn_key') || '' : '');
// Ambil YT key: user key (langsung ke Google) atau fallback ke env (via proxy)
export const getYtKey     = () => _USER_YT_KEY || _ENV_YT_KEY;
export const isYtApiEnabled = () => !!(getYtKey());

// ═══════════════════════════════════════════════════════
//  SPOTIFY — Client Credentials token + search
// ═══════════════════════════════════════════════════════
export const SP_CLIENT_ID     = ''; // server-side via /api/spotify-token
export const SP_CLIENT_SECRET = ''; // server-side via /api/spotify-token

let _spToken = null;
let _spTokenExp = 0;

async function getSpotifyToken() {
  if (_spToken && Date.now() < _spTokenExp) return _spToken;
  const spId = getSpId(); const spSec = getSpSecret();
  try {
    let res;
    if (spId && spSec) {
      // User-supplied credentials — call Spotify directly from browser
      res = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': 'Basic ' + btoa(`${spId}:${spSec}`),
        },
        body: 'grant_type=client_credentials',
      });
    } else {
      // No user key — use server-side proxy (SPOTIFY_CLIENT_ID/SECRET in Vercel env)
      res = await fetch('/api/spotify-token', { method: 'POST' });
    }
    if (!res.ok) return null;
    const data = await res.json();
    _spToken = data.access_token;
    _spTokenExp = Date.now() + (data.expires_in - 60) * 1000;
    return _spToken;
  } catch { return null; }
}

async function searchSpotify(query, limit = 10) {
  const token = await getSpotifyToken();
  if (!token) return null;
  try {
    const res = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=${limit}&market=ID`,
      { headers: { 'Authorization': `Bearer ${token}` } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return (data.tracks?.items || []).map(t => ({
      id: t.id,
      title: t.name,
      artist: t.artists.map(a => a.name).join(', '),
      album: t.album.name,
      cover: t.album.images?.[1]?.url || t.album.images?.[0]?.url || '',
      duration: t.duration_ms,
      previewUrl: t.preview_url,
      spotifyUrl: t.external_urls?.spotify || '',
    }));
  } catch { return null; }
}

// ═══════════════════════════════════════════════════════
//  SOUNDCLOUD — API search (requires client_id) + resolve
// ═══════════════════════════════════════════════════════
export const SC_CLIENT_ID = ''; // user supplies via Settings

async function searchSoundCloud(query, limit = 10) {
  const scId = getScId();
  if (!scId) return null;
  try {
    const res = await fetch(
      `https://api.soundcloud.com/tracks?q=${encodeURIComponent(query)}&limit=${limit}&client_id=${scId}`,
      { headers: { Accept: 'application/json; charset=utf-8' } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return (Array.isArray(data) ? data : data.collection || []).map(t => ({
      id: String(t.id),
      title: t.title || 'Unknown',
      artist: t.user?.username || 'SoundCloud',
      cover: (t.artwork_url || t.user?.avatar_url || '').replace('-large', '-t300x300'),
      duration: Math.round((t.duration || 0) / 1000),
      permalinkUrl: t.permalink_url || '',
      streamUrl: t.permalink_url || '',
      waveformUrl: t.waveform_url || '',
    }));
  } catch { return null; }
}


export const askAI = async (user, system='', tries=0) => {
  const PROVIDERS = getProviders();
  if (!PROVIDERS.length) return '⚠️ No API key found. Add one in Settings or Vercel Environment Variables.';
  if (tries >= PROVIDERS.length) { slotIdx = 0; return 'Semua provider tidak tersedia saat ini, coba beberapa saat lagi.'; }
  // Round-robin: mulai dari slotIdx, tapi jangan reset global sampai berhasil
  const startSlot = slotIdx % PROVIDERS.length;
  const slot = PROVIDERS[startSlot];
  try {
    let res, data, txt;
    if (!slot.isOpenAI) {
      // ── Format Anthropic native (Claude)
      res = await fetch(slot.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': slot.key,
          ...slot.extra,
        },
        body: JSON.stringify({
          model: slot.model,
          max_tokens: 500,
          ...(system ? { system } : {}),
          messages: [{ role:'user', content:user }],
        }),
      });
      data = await res.json();
      if (res.status === 429 || res.status === 503 || res.status === 401 || res.status === 404 || data.error) {
        console.warn(`[Chat] ${slot.provider}/${slot.model} status ${res.status}`, data.error?.message || '');
        slotIdx = (startSlot + 1) % PROVIDERS.length;
        return askAI(user, system, tries + 1);
      }
      txt = data.content?.[0]?.text;
    } else {
      // ── Format OpenAI-compatible (OpenAI, OpenRouter, Gemini, Groq, dll.)
      res = await fetch(slot.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // __proxy__ slots are server-side proxies — key is injected by Vercel, not the browser
          // __nokey__ slots are public free endpoints — no auth header at all
          ...(slot.key !== '__proxy__' && slot.key !== '__nokey__' ? { 'Authorization': `Bearer ${slot.key}` } : {}),
          ...slot.extra,
        },
        body: JSON.stringify({
          model: slot.model,
          max_tokens: 500,
          messages: [
            ...(system ? [{ role:'system', content:system }] : []),
            { role:'user', content:user },
          ],
        }),
      });
      data = await res.json();
      if (res.status === 429 || res.status === 503 || res.status === 401 || res.status === 404 || data.error) {
        console.warn(`[Chat] ${slot.provider}/${slot.model} status ${res.status}`, data.error?.message || '');
        slotIdx = (startSlot + 1) % PROVIDERS.length;
        return askAI(user, system, tries + 1);
      }
      txt = data.choices?.[0]?.message?.content;
    }
    if (!txt) {
      console.warn(`[Chat] ${slot.provider}/${slot.model} returned no text`);
      slotIdx = (startSlot + 1) % PROVIDERS.length;
      return askAI(user, system, tries + 1);
    }
    // Berhasil — majukan slot supaya request berikutnya pakai provider berikutnya (round-robin)
    slotIdx = (startSlot + 1) % PROVIDERS.length;
    return txt.trim();
  } catch(e) {
    console.warn(`[Chat] ${slot.provider}/${slot.model} network error:`, e?.message);
    slotIdx = (startSlot + 1) % PROVIDERS.length;
    return askAI(user, system, tries + 1);
  }
}

// ── askAIRace: kirim ke SEMUA provider paralel, ambil yang pertama berhasil balas
export const askAIRace = async (user, system='') => {
  const PROVIDERS = getProviders();
  if (!PROVIDERS.length) return '⚠️ No API key found. Add one in Settings or Vercel Environment Variables.';

  // Deduplicate by endpoint+model
  const seen = new Set();
  const uniq = PROVIDERS.filter(p => {
    const k = p.endpoint + '|' + p.model;
    if (seen.has(k)) return false;
    seen.add(k); return true;
  });

  // Build one fetch promise per provider
  const makeReq = (slot) => {
    const body = slot.isOpenAI
      ? { model: slot.model, max_tokens: 500,
          messages: [...(system ? [{ role:'system', content:system }] : []), { role:'user', content:user }],
          ...slot.extra }
      : { model: slot.model, max_tokens: 500,
          ...(system ? { system } : {}),
          messages: [{ role:'user', content:user }] };

    // __proxy__ slots: key lives in Vercel env vars, not the browser — omit Authorization header
    // __nokey__ slots: public free endpoints — no auth header at all
    const headers = slot.isOpenAI
      ? { 'Content-Type':'application/json',
          ...(slot.key !== '__proxy__' && slot.key !== '__nokey__' ? { 'Authorization': `Bearer ${slot.key}` } : {}),
          ...slot.extra }
      : { 'Content-Type':'application/json', 'x-api-key': slot.key, ...slot.extra };

    return fetch(slot.endpoint, { method:'POST', headers, body: JSON.stringify(body) })
      .then(async res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (data.error) throw new Error(data.error.message || 'API error');
        const txt = slot.isOpenAI ? data?.choices?.[0]?.message?.content : data?.content?.[0]?.text;
        if (!txt) throw new Error('empty response');
        // Update slotIdx & lastWinner label supaya tampilan "model aktif" akurat
        const idx = PROVIDERS.findIndex(p => p.endpoint === slot.endpoint && p.model === slot.model);
        if (idx !== -1) slotIdx = (idx + 1) % PROVIDERS.length;
        const winnerLabel = `${slot.provider}·${slot.model.split('/').pop()?.replace(':free','') || slot.model}`;
        _lastWinnerLabel = winnerLabel;
        console.log(`[Chat/race] Winner: ${slot.provider}/${slot.model}`);
        return txt.trim();
      })
      .catch(e => {
        console.warn(`[Chat/race] ${slot.provider}/${slot.model} failed:`, e?.message);
        return Promise.reject(e);
      });
  };

  // Promise.any = ambil yang pertama resolve (bukan reject)
  try {
    return await Promise.any(uniq.map(makeReq));
  } catch {
    return 'Semua provider tidak tersedia saat ini, coba beberapa saat lagi.';
  }
};


// lastWinnerModel: diupdate oleh askAIRace setiap kali ada provider yang menang
let _lastWinnerLabel = '';
export const setLastWinnerLabel = (label) => { _lastWinnerLabel = label; };
export const activeModel = () => {
  if (!getProviders().length) return 'no-key';
  if (_lastWinnerLabel) return _lastWinnerLabel;
  const s = getProviders()[slotIdx % getProviders().length];
  return `${s.provider}·${s.model.split('/').pop()?.replace(':free','') || s.model}`;
};
export const hasKey = () => getProviders().length > 0;

// ═══════════════════════════════════════════════════════
// Cache list Drive agar tidak re-fetch setiap login
export const _driveCache = { token: null, songs: null, ts: 0 };
export const DRIVE_CACHE_TTL = 5 * 60 * 1000; // 5 menit
// Cache in-memory (sesi ini) + Cache API (persisten antar refresh)
export const _blobCache = new Map();
window._snBlobCacheRef = _blobCache; // expose agar handleClearCache bisa clear in-memory cache
export const DRIVE_CACHE_NAME = 'sn-drive-v1';
const DRIVE_SIZE_KEY   = 'sn_drive_sizes'; // localStorage key untuk menyimpan ukuran file penuh
export const YT_CACHE_NAME    = 'sn-yt-v1';      // cache audio YouTube yang di-love

// Simpan audio blob YouTube ke cache
async function ytCachePut(videoId, blob) {
  try {
    const cache = await caches.open(YT_CACHE_NAME);
    await cache.put(`/yt/${videoId}`, new Response(blob, { headers: { 'Content-Type': blob.type || 'audio/mpeg' } }));
  } catch { /* private browsing / storage penuh */ }
}

// Ambil audio blob YouTube dari cache
async function ytCacheGet(videoId) {
  try {
    const cache = await caches.open(YT_CACHE_NAME);
    const res = await cache.match(`/yt/${videoId}`);
    if (res) return await res.blob();
  } catch {}
  return null;
}

// Download audio YouTube via Piped API → simpan ke cache
// Mencoba semua instance Piped satu per satu hingga berhasil
async function downloadYtAudio(videoId, onProgress, signal) {
  // Cek cache dulu
  const existing = await ytCacheGet(videoId);
  if (existing && existing.size > 10000) { onProgress && onProgress(100); return; }

  // Coba setiap Piped instance untuk dapatkan audio streams
  let audioUrl = null;
  for (const base of PIPED_INSTANCES) {
    try {
      const res = await fetch(buildPipedUrl(base, `/streams/${videoId}`), { signal });
      if (!res.ok) continue;
      const data = await res.json();
      // Ambil audio stream dengan bitrate tertinggi
      const streams = (data.audioStreams || []).filter(s => s.url && (s.mimeType||'').includes('audio'));
      if (!streams.length) continue;
      streams.sort((a, b) => (b.bitrate||0) - (a.bitrate||0));
      audioUrl = streams[0].url;
      break;
    } catch { continue; }
  }

  if (!audioUrl) throw new Error('No audio stream found');

  // Download blob dengan progress
  const res = await fetch(audioUrl, { signal });
  if (!res.ok) throw new Error(`Audio fetch ${res.status}`);
  const total = parseInt(res.headers.get('content-length') || '0', 10);
  const reader = res.body.getReader();
  const chunks = [];
  let loaded = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    loaded += value.length;
    if (total > 0 && onProgress) onProgress(Math.round((loaded / total) * 100));
  }
  const blob = new Blob(chunks, { type: 'audio/mpeg' });
  await ytCachePut(videoId, blob);
  onProgress && onProgress(100);
}

// ── Unduh file audio ke perangkat (bukan cache browser) — memicu dialog Save As
async function downloadToDevice(url, filename, headers = {}) {
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const blob = await res.blob();
  const blobUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = blobUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
}

// ── Dapatkan URL audio YouTube dari Piped (tanpa simpan ke cache)
async function getYtAudioUrl(videoId) {
  for (const base of PIPED_INSTANCES) {
    try {
      const res = await fetch(buildPipedUrl(base, `/streams/${videoId}`));
      if (!res.ok) continue;
      const data = await res.json();
      const streams = (data.audioStreams || []).filter(s => s.url && (s.mimeType||'').includes('audio'));
      if (!streams.length) continue;
      streams.sort((a, b) => (b.bitrate||0) - (a.bitrate||0));
      return streams[0].url;
    } catch { continue; }
  }
  throw new Error('No audio stream found');
}

// Tandai file sudah ter-download penuh (simpan size ke localStorage)
export function markFullyCached(driveId, size) {
  try {
    const map = JSON.parse(localStorage.getItem(DRIVE_SIZE_KEY) || '{}');
    map[driveId] = size;
    localStorage.setItem(DRIVE_SIZE_KEY, JSON.stringify(map));
  } catch {}
}

// Cek apakah blob di cache adalah file penuh (bukan parsial)
// Mengembalikan { blob, isFull } — isFull true jika ukuran cocok dengan yang tersimpan
export function checkCachedBlob(driveId, blob) {
  try {
    const map = JSON.parse(localStorage.getItem(DRIVE_SIZE_KEY) || '{}');
    const expectedSize = map[driveId];
    if (!expectedSize) return { blob, isFull: false }; // belum pernah selesai download
    return { blob, isFull: blob.size >= expectedSize * 0.98 }; // toleransi 2%
  } catch {}
  return { blob, isFull: false };
}

// Cari folder "Starry Night Music" (hanya untuk upload — TIDAK membuat otomatis)
async function driveGetFolderId(token) {
  const q = encodeURIComponent(`mimeType='application/vnd.google-apps.folder' and name='${DRIVE_FOLDER}' and trashed=false`);
  const res = await fetch(`https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,name)&pageSize=1`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error(`Folder search error ${res.status}`);
  const data = await res.json();
  return (data.files && data.files.length > 0) ? data.files[0].id : null;
}

// Buat folder "Starry Night Music" jika belum ada (dipanggil saat upload saja)
async function driveEnsureFolder(token) {
  const existing = await driveGetFolderId(token);
  if (existing) return existing;
  const create = await fetch('https://www.googleapis.com/drive/v3/files', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: DRIVE_FOLDER, mimeType: 'application/vnd.google-apps.folder' }),
  });
  if (!create.ok) throw new Error('Gagal membuat folder Drive');
  const folder = await create.json();
  return folder.id;
}

// Ekstensi audio yang valid (untuk filter octet-stream / MIME tidak dikenal)
export const AUDIO_EXTS = ['.mp3','.m4a','.aac','.ogg','.oga','.wav','.flac','.opus','.wma','.aiff','.aif','.webm','.3gp','.3gpp'];
export function isAudioExt(name) {
  const lower = (name||'').toLowerCase();
  return AUDIO_EXTS.some(e => lower.endsWith(e));
}

// MIME type tambahan yang Google Drive kadang assign ke file audio
export const AUDIO_MIME_EXTRAS = new Set([
  'application/octet-stream',
  'application/mpeg',
  'application/mp3',
  'application/x-mp3',
  'application/x-mpeg',
  'application/ogg',
  'application/x-ogg',
  'video/mp4',      // M4A sering mis-MIME sebagai video/mp4
  'video/webm',     // opus/webm audio mis-MIME
]);

// Ambil file audio HANYA dari folder "Starry Night Music" di Google Drive
async function driveListSongs(token, forceRefresh = false) {
  const now = Date.now();
  if (!forceRefresh && _driveCache.token === token && _driveCache.songs
      && (now - _driveCache.ts) < DRIVE_CACHE_TTL) {
    return _driveCache.songs;
  }
  if (_driveCache.token && _driveCache.token !== token) forceRefresh = true;

  const fields = 'nextPageToken,files(id,name,mimeType,appProperties,size)';

  // Cari folder "Starry Night Music" dulu
  const folderId = await driveGetFolderId(token);
  if (!folderId) {
    // Folder belum ada — kembalikan array kosong
    _driveCache.token = token;
    _driveCache.songs = [];
    _driveCache.ts    = now;
    return [];
  }

  // Query dibatasi ke folder Starry Night Music saja
  const RAW_Q =
    `'${folderId}' in parents and trashed=false and (` +
      "mimeType contains 'audio/' or " +
      "mimeType = 'video/mp4' or " +
      "mimeType = 'video/webm' or " +
      "mimeType = 'application/octet-stream' or " +
      "mimeType = 'application/mpeg' or " +
      "mimeType = 'application/ogg'" +
    ")";

  const makeUrl = (pt) =>
    `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(RAW_Q)}` +
    `&fields=${fields}&pageSize=1000&orderBy=name${pt ? '&pageToken=' + pt : ''}`;

  const headers = { Authorization: `Bearer ${token}` };

  let resp;
  try { resp = await fetch(makeUrl(''), { headers }); }
  catch(e) { throw new Error('Koneksi gagal: ' + e.message); }
  if (resp.status === 401 || resp.status === 403) throw new Error(`${resp.status} token expired`);
  if (!resp.ok) throw new Error(`Drive list error ${resp.status}`);

  const firstData = await resp.json();
  let allFiles = [...(firstData.files || [])];

  // Pagination
  let nextToken = firstData.nextPageToken;
  while (nextToken) {
    const page = await fetch(makeUrl(nextToken), { headers });
    if (!page.ok) break;
    const pd = await page.json();
    allFiles = allFiles.concat(pd.files || []);
    nextToken = pd.nextPageToken;
  }

  // Filter: audio/* selalu lolos; MIME lain lolos hanya jika nama file punya ekstensi audio
  const audioFiles = allFiles.filter(f => {
    const mime = f.mimeType || '';
    if (mime.startsWith('audio/')) return true;
    // MIME alternatif (video/mp4, application/mpeg, dll.) — wajib punya ekstensi audio
    if (AUDIO_MIME_EXTRAS.has(mime)) return isAudioExt(f.name);
    return false;
  });

  const songs = audioFiles.map(f => {
    const ap = f.appProperties || {};
    const ci = randItem(SONG_COLORS);
    return {
      id:      `drive_${f.id}`,
      driveId: f.id,
      title:   ap.title  || f.name.replace(/\.[^/.]+$/, ''),
      artist:  ap.artist || 'Google Drive',
      album:   ap.album  || 'Drive',
      cover:   ap.cover  || randItem(COVERS),
      color:   ap.color  || ci.color,
      bg:      ap.bg     || ci.bg,
      mood:    'personal, custom',
      isDrive: true,
      src:     null,
      mimeType: f.mimeType,
    };
  });

  _driveCache.token  = token;
  _driveCache.songs  = songs;
  _driveCache.ts     = now;
  return songs;
}
// Simpan blob ke Cache API (IndexedDB-like, persisten)
async function cachePut(cacheKey, blob) {
  try {
    const cache = await caches.open(DRIVE_CACHE_NAME);
    await cache.put(`/drive/${cacheKey}`, new Response(blob, { headers: { 'Content-Type': blob.type } }));
  } catch { /* private browsing atau storage penuh */ }
}

// Ambil blob dari Cache API jika ada
async function cacheGet(cacheKey) {
  try {
    const cache = await caches.open(DRIVE_CACHE_NAME);
    const res = await cache.match(`/drive/${cacheKey}`);
    if (res) return await res.blob();
  } catch {}
  return null;
}

// Tebak mime type dari Content-Type header
export function guessMime(contentType) {
  if (!contentType) return 'audio/mpeg';
  if (contentType.includes('ogg')) return 'audio/ogg';
  if (contentType.includes('wav')) return 'audio/wav';
  if (contentType.includes('mp4') || contentType.includes('m4a') || contentType.includes('aac')) return 'audio/mp4';
  if (contentType.includes('flac')) return 'audio/flac';
  if (contentType.includes('webm')) return 'audio/webm';
  return 'audio/mpeg';
}

// Streaming via MediaSource API — audio mulai diputar segera tanpa tunggu download selesai.
// Fallback ke blob biasa jika MediaSource tidak support mime atau response body tidak tersedia.
async function driveStreamBlob(driveId, token) {
  // Cache key: driveId saja (token bisa expired, tapi file-nya sama)
  const cacheKey = driveId;
  const memKey   = `${driveId}:${token.slice(-12)}`;

  // 1. Cek in-memory cache (paling cepat)
  if (_blobCache.has(memKey)) return _blobCache.get(memKey);

  // 2. Cek Cache API (persisten antar refresh) — langsung bisa diputar tanpa download ulang
  const cachedBlob = await cacheGet(cacheKey);
  if (cachedBlob) {
    const url = URL.createObjectURL(cachedBlob);
    _blobCache.set(memKey, url);
    return url;
  }

  // 3. Fetch dari Google Drive
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files/${driveId}?alt=media&acknowledgeAbuse=true`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (res.status === 401 || res.status === 403) throw new Error(`${res.status}`);
  if (!res.ok) throw new Error(`Drive ${res.status}`);

  const contentType = res.headers.get('Content-Type') || '';
  const mime = guessMime(contentType);

  const cleanup = () => {
    for (const [k, v] of _blobCache) {
      if (k.startsWith(driveId + ':') && k !== memKey) { URL.revokeObjectURL(v); _blobCache.delete(k); }
    }
  };

  // 4. Gunakan MediaSource streaming — audio langsung bisa diputar tanpa tunggu download selesai
  if (typeof MediaSource !== 'undefined' && MediaSource.isTypeSupported(mime) && res.body) {
    const ms  = new MediaSource();
    const url = URL.createObjectURL(ms);
    cleanup();
    _blobCache.set(memKey, url);

    ms.addEventListener('sourceopen', async () => {
      try {
        const sb = ms.addSourceBuffer(mime);
        const reader = res.body.getReader();
        const chunks = [];
        const waitUpdate = () => new Promise(r => sb.addEventListener('updateend', r, { once: true }));
        const pump = async () => {
          const { done, value } = await reader.read();
          if (done) {
            if (ms.readyState === 'open' && !sb.updating) ms.endOfStream();
            else if (ms.readyState === 'open') { await waitUpdate(); if (ms.readyState === 'open') ms.endOfStream(); }
            const fullBlob = new Blob(chunks, { type: mime });
            markFullyCached(driveId, fullBlob.size);
            cachePut(cacheKey, fullBlob);
            return;
          }
          chunks.push(value);
          if (sb.updating) await waitUpdate();
          if (ms.readyState === 'open' && !sb.updating) { sb.appendBuffer(value); await waitUpdate(); }
          if (ms.readyState === 'open') await pump();
        };
        await pump();
      } catch(e) { if (e?.name !== 'AbortError') console.warn('[DriveBlob] stream error:', e?.message); }
    }, { once: true });
    return url;
  }

  // 5. Fallback: download seluruh blob (format tidak didukung MediaSource)
  const blob = await res.blob();
  const url  = URL.createObjectURL(blob);
  cleanup();
  _blobCache.set(memKey, url);
  markFullyCached(driveId, blob.size);
  cachePut(cacheKey, blob); // simpan ke Cache API
  return url;
}

// ── Mode Lite: stream Drive tanpa download penuh & tanpa simpan ke cache.
// Hanya buffer ~30 detik ke depan, lanjut fetch saat buffer menipis.
// Hemat data + hemat storage. AbortController dikirim agar bisa dibatalkan saat skip.
export const _liteAbortMap = new Map(); // driveId → AbortController
async function driveStreamLite(driveId, token, audioElRef) {
  const memKey = `${driveId}:${token.slice(-12)}:lite`;

  // 1. In-memory URL dari sesi ini (MediaSource URL yang sudah dibuat)
  if (_blobCache.has(memKey)) return _blobCache.get(memKey);

  // Lite: tidak cek Cache API — selalu stream adaptif, tidak pakai blob full dari cache Pro
  for (const [id, ctrl] of _liteAbortMap) { if (id !== driveId) { ctrl.abort(); _liteAbortMap.delete(id); } }
  const abortCtrl = new AbortController();
  _liteAbortMap.set(driveId, abortCtrl);

  // 4. Fetch stream dari Drive
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files/${driveId}?alt=media&acknowledgeAbuse=true`,
    { headers: { Authorization: `Bearer ${token}` }, signal: abortCtrl.signal }
  );
  if (res.status === 401 || res.status === 403) throw new Error(`${res.status}`);
  if (!res.ok) throw new Error(`Drive ${res.status}`);

  const contentType = res.headers.get('Content-Type') || '';
  const mime = guessMime(contentType);

  // Bersihkan URL lama untuk driveId ini
  for (const [k, v] of _blobCache) {
    if (k.startsWith(driveId + ':') && k !== memKey) { URL.revokeObjectURL(v); _blobCache.delete(k); }
  }

  // 5. MediaSource adaptive buffering — hanya buffer AHEAD_SEC detik ke depan
  if (typeof MediaSource !== 'undefined' && MediaSource.isTypeSupported(mime) && res.body) {
    const AHEAD_SEC  = 30; // detik buffer ke depan
    const PAUSE_SEC  = 20; // lanjut fetch kalau buffer < ini
    const ms  = new MediaSource();
    const url = URL.createObjectURL(ms);
    _blobCache.set(memKey, url);

    ms.addEventListener('sourceopen', async () => {
      try {
        const sb     = res.status !== -1 ? ms.addSourceBuffer(mime) : null;
        if (!sb) return;
        const reader = res.body.getReader();
        const waitUpdate = () => new Promise(r => sb.addEventListener('updateend', r, { once: true }));
        let paused = false;

        const getAudio = () => audioElRef && audioElRef.current;

        const pump = async () => {
          if (abortCtrl.signal.aborted) { reader.cancel(); if (ms.readyState === 'open') ms.endOfStream(); return; }

          // Adaptive: pause baca jika sudah buffer cukup ke depan
          const audio = getAudio();
          if (audio && sb.buffered.length > 0) {
            const bufferedEnd = sb.buffered.end(sb.buffered.length - 1);
            const ahead = bufferedEnd - audio.currentTime;
            if (ahead > AHEAD_SEC && !paused) {
              paused = true;
              // Tunggu sampai buffer habis sebelum lanjut fetch
              const resume = () => {
                if (abortCtrl.signal.aborted) return; // sudah di-abort (skip/ganti lagu)
                const a2 = getAudio();
                // Jika audio sudah null atau posisi sudah melewati akhir buffer (atau mendekati) → lanjut fetch
                if (!a2 || a2.currentTime >= bufferedEnd - PAUSE_SEC || a2.currentTime >= bufferedEnd - 5) {
                  paused = false;
                  pump();
                } else {
                  setTimeout(resume, 1500);
                }
              };
              setTimeout(resume, 1500);
              return;
            }
          }

          const { done, value } = await reader.read();
          if (done) {
            if (ms.readyState === 'open') ms.endOfStream();
            // Lite: TIDAK simpan ke Cache API — hemat storage
            return;
          }
          if (sb.updating) await waitUpdate();
          if (ms.readyState === 'open') { sb.appendBuffer(value); await waitUpdate(); }
          await pump();
        };
        await pump();
      } catch(e) {
        if (e.name !== 'AbortError') { /* stream closed / tab navigated */ }
      }
    }, { once: true });
    return url;
  }

  // 6. Fallback blob (MediaSource tidak tersedia) — Lite: tidak simpan ke cache
  const blob = await res.blob();
  const url  = URL.createObjectURL(blob);
  _blobCache.set(memKey, url);
  // Lite: tidak cachePut — hemat storage
  return url;
}

// Download full blob — Pro mode: stream langsung bisa diputar, progress nyata, simpan cache saat selesai
// onProgress(pct 0-100) dipanggil selama download, onComplete() dipanggil saat blob penuh tersimpan
// forceDownload: skip cache check (dipakai saat melanjutkan cache parsial)
async function driveDownloadBlob(driveId, token, onProgress, onComplete, forceDownload = false) {
  const cacheKey = driveId;
  const memKey   = `${driveId}:${token.slice(-12)}`;

  if (!forceDownload && _blobCache.has(memKey)) {
    onProgress && onProgress(100); onComplete && onComplete();
    return _blobCache.get(memKey);
  }

  if (!forceDownload) {
    const cachedBlob = await cacheGet(cacheKey);
    if (cachedBlob) {
      const { isFull } = checkCachedBlob(driveId, cachedBlob);
      if (isFull) {
        const url = URL.createObjectURL(cachedBlob);
        _blobCache.set(memKey, url);
        onProgress && onProgress(100); onComplete && onComplete();
        return url;
      }
      // Parsial — lanjut download ulang dari awal (tidak ada range request di Drive API publik)
    }
  }

  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files/${driveId}?alt=media&acknowledgeAbuse=true`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (res.status === 401 || res.status === 403) throw new Error(`${res.status}`);
  if (!res.ok) throw new Error(`Drive ${res.status}`);

  const contentType = res.headers.get('Content-Type') || '';
  const mime = guessMime(contentType);
  const total = parseInt(res.headers.get('Content-Length') || '0', 10);

  // Jangan revoke URL lain untuk driveId ini — bisa saja masih aktif diputar (dari driveStreamBlob)
  // Hanya bersihkan setelah download selesai & blob baru siap

  // Gunakan MediaSource agar audio langsung bisa diputar sambil download berlangsung
  if (typeof MediaSource !== 'undefined' && MediaSource.isTypeSupported(mime) && res.body) {
    const ms  = new MediaSource();
    const url = URL.createObjectURL(ms);
    _blobCache.set(memKey, url);

    ms.addEventListener('sourceopen', async () => {
      try {
        const sb = ms.addSourceBuffer(mime);
        const reader = res.body.getReader();
        const chunks = [];
        let loaded = 0;
        const waitUpdate = () => new Promise(r => sb.addEventListener('updateend', r, { once: true }));
        const pump = async () => {
          const { done, value } = await reader.read();
          if (done) {
            if (ms.readyState === 'open') ms.endOfStream();
            const fullBlob = new Blob(chunks, { type: mime });
            markFullyCached(driveId, fullBlob.size);
            await cachePut(cacheKey, fullBlob);
            onProgress && onProgress(100);
            onComplete && onComplete();
            return;
          }
          chunks.push(value);
          loaded += value.byteLength;
          if (total > 0) onProgress && onProgress(Math.min(99, Math.round(loaded / total * 100)));
          if (sb.updating) await waitUpdate();
          if (ms.readyState === 'open') { sb.appendBuffer(value); await waitUpdate(); }
          await pump();
        };
        await pump();
      } catch(e) { if (e.name !== 'AbortError') console.warn('driveDownloadBlob stream error', e); }
    }, { once: true });
    return url;
  }

  // Fallback: baca stream manual jika MediaSource tidak tersedia
  if (res.body) {
    const reader = res.body.getReader();
    const chunks = []; let loaded = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value); loaded += value.byteLength;
      if (total > 0) onProgress && onProgress(Math.min(99, Math.round(loaded / total * 100)));
    }
    const blob = new Blob(chunks, { type: mime });
    const url  = URL.createObjectURL(blob);
    _blobCache.set(memKey, url);
    markFullyCached(driveId, blob.size);
    await cachePut(cacheKey, blob);
    onProgress && onProgress(100); onComplete && onComplete();
    return url;
  }

  // Last resort
  const blob = await res.blob();
  const url  = URL.createObjectURL(blob);
  _blobCache.set(memKey, url);
  markFullyCached(driveId, blob.size);
  await cachePut(cacheKey, blob);
  onProgress && onProgress(100); onComplete && onComplete();
  return url;
}

// Pre-fetch lagu berikutnya di background agar instant saat diklik
async function drivePrefetch(driveId, token) {
  if (!driveId || !token || _blobCache.has(`${driveId}:${token.slice(-12)}`)) return;
  try { await driveStreamBlob(driveId, token); } catch { /* silent fail */ }
}
async function driveUploadSong(file, meta, token) {
  const folderId=await driveEnsureFolder(token), ci=randItem(SONG_COLORS), cover=randItem(COVERS);
  const metadata={ name:file.name, parents:[folderId], appProperties:{ title:meta.title||file.name.replace(/\.[^/.]+$/,''), artist:meta.artist||'Unknown', album:meta.album||'My Songs', cover, color:ci.color, bg:ci.bg } };
  const form=new FormData();
  form.append('metadata', new Blob([JSON.stringify(metadata)],{type:'application/json'}));
  form.append('file', file);
  const res=await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,appProperties',{ method:'POST', headers:{ Authorization:`Bearer ${token}` }, body:form });
  if (!res.ok) { const e=await res.json(); throw new Error(e.error?.message||'Upload failed'); }
  const fd=await res.json();
  return { id:`drive_${fd.id}`, driveId:fd.id, title:metadata.appProperties.title, artist:metadata.appProperties.artist, album:metadata.appProperties.album, cover, color:ci.color, bg:ci.bg, mood:'personal, custom', isDrive:true, src:URL.createObjectURL(file) };
}

// ═══════════════════════════════════════════════════════
//  HELPERS
// ═══════════════════════════════════════════════════════
export const fmt = t => { if (!t||isNaN(t)) return '0:00'; return `${Math.floor(t/60)}:${String(Math.floor(t%60)).padStart(2,'0')}`; };
export const fmtSec = s => { const m=Math.floor(s/60), sec=s%60; return `${m}:${String(sec).padStart(2,'0')}`; };



// ══════════════════════════════════════════════
//  DEVICE DETECTION
// ══════════════════════════════════════════════
export function isPhoneDevice() {
  const ua = navigator.userAgent;
  const isMobileUA = /android|iphone|ipod|blackberry|windows phone/i.test(ua);
  const isTabletUA = /ipad|tablet|(android(?!.*mobile))/i.test(ua);
  const smallScreen = Math.min(window.screen.width, window.screen.height) < 500;
  return (isMobileUA && !isTabletUA) || smallScreen;
}
