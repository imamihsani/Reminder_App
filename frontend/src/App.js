import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';

function App() {

  useEffect(() => {
    if (Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);

  const [reminders, setReminders] = useState([]);
  const [text, setText] = useState('');
  const [time, setTime] = useState('');

  const API = 'http://localhost:5000/reminders';

  const [error, setError] = useState('');

  const [toast, setToast] = useState('');
  
  const audioRef = useRef(null);

  useEffect(() => {
    audioRef.current = new Audio('/alarm.mp3');
  }, []);

  // == kunci audio biar ga eror==/
  const [audioReady, setAudioReady] = useState(false);
  const unlockAudio = () => {
    if (audioRef.current) {
      audioRef.current.play().then(() => {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        setAudioReady(true);
      }).catch(() => {});
    }
  };

  // ===== ambil data =====
  const fetchData = async () => {
    const res = await axios.get(API);
    setReminders(res.data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const triggeredRef = useRef(new Set());
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();

      reminders.forEach(r => {
        const reminderTime = new Date(r.time);

        if (
          now >= reminderTime &&
          !triggeredRef.current.has(r.id)
        ) {
          // 🔔 NOTIF BROWSER
          if (Notification.permission === "granted") {
            // new Notification("Reminder", {
            //   body: r.text,
            // });
            new Notification("Reminder", {
              body: r.text,
              icon: "/icon.png",
              badge: "/icon.png"
            });
            //biar klo diklik notifnya masuk ke tab nya lagi
            const notif = new Notification("Reminder", {
              body: r.text,
              icon: "/icon.png"
            });
            notif.onclick = () => {
              window.focus();
            };
          }

          // 🔊 SUARA
          if (audioRef.current && audioReady) {
            audioRef.current.play();
          }

          triggeredRef.current.add(r.id);
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [reminders]);

  // ===== tambah =====
  // const addReminder = async () => {
  //   if (!text || !time) return alert('Isi dulu!');

  //   const localTime = new Date(time); 

  //   await axios.post(API, { 
  //     text, 
  //     time: localTime.toISOString() 
  //   });

  //   setText('');
  //   setTime('');
  //   fetchData();
  // };

  const addReminder = async () => {
  // if (!text || !time) {
  //   setError('Isi dulu bro agendanya');
  //   return;
  // }
  if (!text || !time) {
    setToast('Isi dulu agendanya.');
    setTimeout(() => setToast(''), 2000);
    return;
  }

  setError(''); // reset error

  const localTime = new Date(time);

  await axios.post(API, { 
    text, 
    time: localTime.toISOString()
  });

  setText('');
  setTime('');
  fetchData();
};

  // ===== hapus =====
  const deleteReminder = async (id) => {
    await axios.delete(`${API}/${id}`);
    fetchData();
  };

  // return (
  //   <div style={{ padding: 20 }}>
  //     <h2>Reminder App</h2>

  //     <input
  //       placeholder="Isi reminder"
  //       value={text}
  //       onChange={(e) => setText(e.target.value)}
  //     />

  //     <input
  //       type="datetime-local"
  //       value={time}
  //       onChange={(e) => setTime(e.target.value)}
  //     />

  //     <button onClick={addReminder}>Tambah</button>

  //     <ul>
  //       {reminders.map((r) => (
  //         <li key={r.id}>
  //           {r.text} - {new Date(r.time).toLocaleString()}
  //           <button onClick={() => deleteReminder(r.id)}>Hapus</button>
  //         </li>
  //       ))}
  //     </ul>
  //   </div>
  // );
  return (
    <div style={{
      minHeight: '100vh',
      padding: 20,
      background: 'linear-gradient(135deg, #667eea, #764ba2)'
    }}>
      {/*  TOAST TARUH DI SINI (LUAR CARD) */}
      {toast && (
        <div style={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          zIndex: 9999,
          background: '#e7ee2d',
          color: '#000',
          padding: '12px 18px',
          borderRadius: 10,
          boxShadow: '0 6px 20px rgba(0,0,0,0.3)'
        }}>
          {toast}
        </div>
      )}
      <div style={{ padding: 20, maxWidth: 900, margin: 'auto',background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', color: '#000'  }}>
        <h2 style={{textAlign:'center'}}>Reminder App</h2>
        <div style={{
          background: '#f0f7ff',
          borderLeft: '5px solid #f0f7ff',
            borderRight: '5px solid #f0f7ff',
            color: '#fff',
            textAlign: 'center',
            fontSize: 14,
            marginBottom: 15,
            backgroundColor: '#ff4d4f'
          }}>
          <i>Suitable for ADHD sufferers, haha. Turn on to maximum audio for best experience.</i>
        </div>
        {/* FORM */}
        <div style={{
          display: 'flex',
          gap: 10,
          marginBottom: 20
        }}>
        
          <input
            placeholder="Isi reminder"
            value={text}
            onChange={(e) => setText(e.target.value)}
            style={{ flex: 2, padding: 10, borderRadius: 8, border: '1px solid #ccc' }}
          />

          <input
            type="datetime-local"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            style={{ flex: 2, padding: 10, borderRadius: 8, border: '1px solid #ccc' }}
          />

          <button
            onClick={() => {
              unlockAudio(); 
              addReminder();
            }}
            style={{
              background: '#111',
              color: '#fff',
              border: 'none',
              padding: '10px 16px',
              borderRadius: 8,
              cursor: 'pointer'
            }}
          >
            Tambah
          </button>
        </div>

        {/* CARD GRID */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
          gap: 15
        }}>
          {reminders.map((r) => (
            <div key={r.id} style={{
              background: '#fff',
              padding: 15,
              borderRadius: 12,
              boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.03)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              <div>
                <h4 style={{ margin: '0 0 10px 0' }}>{r.text}</h4>
                <p style={{ margin: 0, color: '#666', fontSize: 14 }}>
                  {new Date(r.time).toLocaleString('id-ID', {
                    dateStyle: 'medium',
                    timeStyle: 'short'
                  })}
                </p>
              </div>

              <button
                onClick={() => deleteReminder(r.id)}
                style={{
                  marginTop: 15,
                  background: '#ff4d4f',
                  color: '#fff',
                  border: 'none',
                  padding: '8px',
                  borderRadius: 8,
                  cursor: 'pointer'
                }}
              >
                Hapus
              </button>
            </div>
          ))}
        </div>
      </div>
      <p style={{ textAlign: 'center', fontSize: '10px'}}><i>Developed with Pecut AI and Googling method by IMX</i></p>
    </div>
  );
}

export default App;