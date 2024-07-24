// Import modul yang diperlukan
const { DisconnectReason, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const { text } = require('express');
const makeWASocket = require('@whiskeysockets/baileys').default;
const fs = require('fs-extra'); // fs-extra untuk operasi file
const path = require('path');

const authFolderPath = path.join(__dirname, 'auth_info_baileys');

async function connectionLogic() {
    const { state, saveCreds } = await useMultiFileAuthState(authFolderPath);
    const sock = makeWASocket({
        printQRInTerminal: true,
        auth: state
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update || {};

        if (qr) {
            console.log('Scan the QR code:', qr);
        }

        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut);

            if (lastDisconnect?.error?.output?.statusCode === DisconnectReason.loggedOut) {
                // Hapus folder auth_info_baileys dan regenerasi QR code
                console.log('Logged out, clearing auth folder and regenerating QR code');
                await fs.remove(authFolderPath);
                connectionLogic();
            } else if (shouldReconnect) {
                connectionLogic();
            }
        }
    });

    sock.ev.on('messages.update', (messageInfo) => {
        // Iterate through each message in the array
        messageInfo.forEach((message) => {
            // Access each message and its properties
            console.log('pesan =>', message.message);
            console.log('pesan2 =>', (message.key))
            console.log('pesan3 =>', message.pushName);

            // Cek jika pesan adalah "hello"
            if (message.message && message.message.toLowerCase() === 'hello') {
                // Balas pesan dengan "hai"
                sock.sendMessage(message.key.remoteJid, 'Hai!');
            }
        });
    });
    // Event listener untuk pesan yang diupdate
    sock.ev.on('messages.upsert', (messageInfoUpsert) => {
        // Iterate through each message in the array
        messageInfoUpsert.messages.forEach(async (message) => {
            // Print message details
            console.log('pesan4 =>');
            console.log('Key:', message.key);
            console.log('Timestamp:', message.messageTimestamp);
            console.log('Push Name:', message.pushName);
            console.log('Broadcast:', message.broadcast);

            const validNumbers = ['1', '2', '3', '4', '5', '6'];
            const invalidNumbers = ['7', '8', '9', '0'];
            const conversation = message.message?.conversation;


            if (message.message && message.message.conversation) {
                console.log('Message Conversation:', message.message.conversation);
                // Jika pesan adalah "Halo! Bisakah saya mendapatkan info selengkapnya tentang ini?"
                if (message.message.conversation) {
                    const conversation = message.message.conversation;

                    // Pattern regex untuk mencocokkan format pesan
                    const regex = /Nama Lengkap\s*:\s*(.+)\nDomisili\s*:\s*(.+)\nUsia\s*:\s*(\d+)/i;
                    const match = conversation.match(regex);

                    if (match) {
                        const [_, name, domisili, age] = match;

                        const responseMessage1 = {
                            text: `Halo ${name}, Saya Jilliyan Tim Edukasi Malahayati Consultant`
                        };

                        sock.sendMessage(message.key.remoteJid, responseMessage1);
                        setTimeout(() => {
                            // Kirim pesan kedua
                            const responseMessage2 = {
                                text: "Silahkan ketik angka di bawah ini untuk informasi lebih lanjut:\n📲Ketik 1 untuk info Legalitas\n📲Ketik 2 untuk info cara kerja\n📲Ketik 3 untuk info cara kerja antar kota\n📲Ketik 4 untuk info yang sudah galbay\n📲Ketik 5 untuk info ongkos jasa\n📲Ketik 6 untuk isi Form Pendaftaran\nAdmin akan segera merespon setelah pengisian Form Pendaftaran"
                            };
                            sock.sendMessage(message.key.remoteJid, responseMessage2);
                        }, 500);
                    }
                }
                if (validNumbers.includes(conversation)) {
                    if (message.message.conversation === '1') {
                        // Kirim gambar yang telah disiapkan
                        const responseMessage1 = {
                            image: {
                                url: "./image/legal.jpeg"
                            },
                            caption: '*Malahayati Consultant* adalah lembaga resmi yang memiliki legalitas perusahaan dan berbadan hukum di bawah naungan\n*PT. MALAHAYATI NUSANTARA RAYA*',
                            viewOnce: false
                        };
                        sock.sendMessage(message.key.remoteJid, responseMessage1);
                        setTimeout(() => {
                            sock.sendMessage(message.key.remoteJid, { audio: { url: "./legals.opus", mimetype: 'audio/mp4' } });
                        }, 2000)
                        setTimeout(() => {

                            const responseMessage2 = {
                                text: 'Alamat Kantor Pusat: Jl. Mampang Prpt. Raya No.2 6, RT.6/RW.6, Mampang Prpt., Kec. Mampang Prpt., Kota Jakarta Selatan, Daerah Khusus Ibukota Jakarta 12790\n(https://maps.app.goo.gl/WMZCaA9A9VodYh8DA)\n\n*Alamat Kantor Cabang Meruya* : Jl. Meruya Ilir Raya No.8B, RT.7/RW.6, Meruya Utara, Kec. Kembangan, Kota Jakarta Barat, Daerah Khusus Ibukota Jakarta 11620\n(https://maps.app.goo.gl/cF3DNjDdMsu6D9AS8)\n\n*Alamat Kantor Cabang Bekasi* : Komplek Ruko, Jl. Pesona Anggrek Harapan No.15A Blok A05, Harapan Jaya, Kec. Bekasi Utara, Kota Bks, Jawa Barat 17124\n(https://maps.app.goo.gl/61rg6aMbjbPHq1ja8)\n\n*Alamat Kantor Cabang Sukabumi* : Ruko Permata, Jl. Lkr. Sel., RT.018/RW.004, Cibatu, Kec. Cisaat, Kabupaten Sukabumi, Jawa Barat 43152\n(https://maps.app.goo.gl/JRUdW5qTzwvwbZbB7)\n\n*Alamat Kantor Cabang Probolinggo* : Jl. Probolinggo - Wonorejo, Kebonsari Wetan, Kec. Kanigaran, Kota Probolinggo, Jawa Timur 67214\n(https://maps.app.goo.gl/f39jS7mxA9PEGP666)\n\n*Alamat Kantor Cabang Serang* : Jl. Jayadiningrat Jl. Kaujon Kidul No.1, Serang, Kec. Serang, Kota Serang, Banten 42116\n(https://maps.app.goo.gl/mYX4YYy9cTRM18pr9)'
                            };
                            sock.sendMessage(message.key.remoteJid, responseMessage2,);
                        }, 2000)

                    }
                    else if (message.message.conversation === '2') {

                        setTimeout(() => {
                        })
                        // Kirim gambar yang telah disiapkan
                        const responseMessage1 = {
                            text: 'Satu satunya cara untuk lepas dari jeratan pinjol adalah *stop melakukan pembayaran PINJOL*.\nSegala resiko dari Stop Pembayaran Pinjol akan kami cover sepenuhnya, antara lain:\n\n*1. Menyebar data di kontak pribadi.*\n*2. Didatangi oleh kolektor berkali-kali dan berganti kolektor.*\n*3. Risiko akibat BI Checking/Slik OJK.*\n\nDengan kehadiran Malahayati Consultant, ketiga risiko tersebut dapat ditangani dengan aman.'
                        };
                        sock.sendMessage(message.key.remoteJid, responseMessage1,);

                        setTimeout(() => {
                            // Kirim pesan kedua
                            const responseMessage2 = {
                                text: "Silahkan ketik angka di bawah ini :\n📲Ketik 1 untuk info Legalitas\n📲Ketik 2 untuk info cara kerja\n📲Ketik 3 untuk info cara kerja antar kota\n📲Ketik 4 untuk info yang sudah galbay\n📲Ketik 5 untuk info ongkos jasa\n📲Ketik 6 untuk isi Form Pendaftaran\nAdmin akan segera merespon setelah pengisian Form Pendaftaran"
                            };
                            sock.sendMessage(message.key.remoteJid, responseMessage2);
                        }, 1000);
                    }

                    else if (message.message.conversation === '3') {
                        // Kirim gambar yang telah disiapkan
                        const responseMessage1 = {
                            text: 'Malahayati Consultant akan membantu kalian yang ingin berhenti melakukan pembayaran pinjaman online atau galbay secara aman. Aman dari risiko-risiko yang harus ditanggung, antara lain:\n\n*1. Menyebar data di kontak pribadi*.\n*2. Didatangi oleh kolektor berkali-kali dan berganti kolektor*.\n*3. Risiko akibat BI Checking/Slik OJK*.\n\nDengan Malahayati Consultant, ketiga risiko tersebut dapat diatasi dengan aman. Jika tertarik, isi *Formulir Pendaftaran*. Tim kami akan validasi data lewat Video Call. Biaya tol dan bensin ditanggung oleh nasabah. Klien luar pulau: Tim beri foto KTP, klien beli tiket pesawat.'
                        };
                        sock.sendMessage(message.key.remoteJid, responseMessage1,);
                        setTimeout(() => {
                            // Kirim pesan kedua
                            const responseMessage2 = {
                                text: "Silahkan ketik angka di bawah ini :\n📲Ketik 1 untuk info Legalitas\n📲Ketik 2 untuk info cara kerja\n📲Ketik 3 untuk info cara kerja antar kota\n📲Ketik 4 untuk info yang sudah galbay\n📲Ketik 5 untuk info ongkos jasa\n📲Ketik 6 untuk isi Form Pendaftaran\nAdmin akan segera merespon setelah pengisian Form Pendaftaran"
                            };
                            sock.sendMessage(message.key.remoteJid, responseMessage2);
                        }, 1000);
                    }
                    else if (message.message.conversation === '4') {
                        // Kirim gambar yang telah disiapkan
                        const responseMessage4 = {
                            text: 'Masih bisa, Tim kami akan berupaya mencarikan modal dari pinjol dengan cara yang aman. *Walaupun peluangnya lebih kecil dari Client yang belum jatuh tempo/galbay*. Agar Anda dapat membayar Jasa kami tanpa harus keluar uang pribadi. Dana yang masuk ke rekening dari pengerjaan Tim akan di bagi 2 yaitu 50% sebagai modal bagi Anda. Dan 50% lagi adalah fee untuk Tim. Semua Aplikasi yang di kerjakan oleh Tim, Biaya backupnya gratis. Anda hanya perlu membayar biaya backup aplikasi yang Anda cairkan sendiri dengan data asli, menggunakan dana 50% tadi.'
                        };
                        sock.sendMessage(message.key.remoteJid, responseMessage4,);

                        setTimeout(() => {
                            // Kirim pesan kedua
                            const responseMessage2 = {
                                text: "Silahkan ketik angka di bawah ini :\n📲Ketik 1 untuk info Legalitas\n📲Ketik 2 untuk info cara kerja\n📲Ketik 3 untuk info cara kerja antar kota\n📲Ketik 4 untuk info yang sudah galbay\n📲Ketik 5 untuk info ongkos jasa\n📲Ketik 6 untuk isi Form Pendaftaran\nAdmin akan segera merespon setelah pengisian Form Pendaftaran"
                            };
                            sock.sendMessage(message.key.remoteJid, responseMessage2);
                        }, 1000);
                    }
                    else if (message.message.conversation === '5') {
                        // Kirim gambar yang telah disiapkan
                        const responseMessage1 = {
                            text: 'Setiap kantor jasa pasti ada biaya jasanya. Biaya jasanya adalah 10%-15% dari Total Piutang Per aplikasi. Tapi Tim kami akan berupaya mencarikan modal dari pinjol dengan cara yang aman. Agar Anda dapat membayar Jasa kami tanpa harus keluar uang pribadi. Dana yang masuk ke rekening dari pengerjaan Tim akan di bagi 2 yaitu 50% sebagai modal bagi Anda. Dan 50% lagi adalah fee untuk Tim. Semua Aplikasi yang di kerjakan oleh Tim, sudah include pembackupan. Anda hanya perlu membayar biaya backup aplikasi yang Anda cairkan sendiri dengan data asli, menggunakan dana 50% tadi.'
                        };
                        sock.sendMessage(message.key.remoteJid, responseMessage1,);
                        setTimeout(() => {
                            // Kirim pesan kedua
                            const responseMessage2 = {
                                text: "Silahkan ketik angka di bawah ini :\n📲Ketik 1 untuk info Legalitas\n📲Ketik 2 untuk info cara kerja\n📲Ketik 3 untuk info cara kerja antar kota\n📲Ketik 4 untuk info yang sudah galbay\n📲Ketik 5 untuk info ongkos jasa\n📲Ketik 6 untuk isi Form Pendaftaran\nAdmin akan segera merespon setelah pengisian Form Pendaftaran"
                            };
                            sock.sendMessage(message.key.remoteJid, responseMessage2);
                        }, 1000);
                    }
                    else if (message.message.conversation === '6') {
                        // Kirim gambar yang telah disiapkan
                        const responseMessage1 = {
                            text: '*FORMULIR PENDAFTARAN*\n\n' +
                                'Nama : \n' +
                                'Usia : \n' +
                                'Lokasi : \n' +
                                'Nomor Hp : \n' +
                                'Jenis Hp : \n' +
                                'RAM HP (khusus Android) :\n' +
                                'Simcard : (masih ada/ sudah tidak ada)\n' +
                                'Rekomendasi : *Raffi Bekher*\n\n' +
                                '𝗔𝗣𝗟𝗜𝗞𝗔𝗦𝗜 𝗬𝗔𝗡𝗚 𝗠𝗔𝗦𝗜𝗛 𝗕𝗘𝗥𝗝𝗔𝗟𝗔𝗡 / 𝗗𝗜𝗥𝗔𝗪𝗔𝗧 :\n' +
                                '1. Nama aplikasi : \n' +
                                '     Total Limit : \n' +
                                '     Tgl, bln jatuh tempo : \n' +
                                '     Sisa angsuran : Rp.\n\n' +
                                '2. Nama aplikasi : \n' +
                                '     Total limit : \n' +
                                '     Tgl, bln jatuh tempo : \n' +
                                '     Sisa angsuran : Rp.\n\n' +
                                '3. Nama aplikasi : \n' +
                                '    Total limit :\n' +
                                '    Tgl, bln jatuh tempo : \n' +
                                '    Sisa angsuran : Rp.\n\n' +
                                '4. Nama aplikasi : \n' +
                                '    Total limit : \n' +
                                '    Tgl, bln jatuh tempo : \n' +
                                '    Sisa angsuran : Rp.\n\n' +
                                '5. Nama aplikasi : \n' +
                                '    Total limit : \n' +
                                '    Tgl, bln jatuh tempo : \n' +
                                '    Sisa angsuran : Rp.\n\n' +
                                '6. Nama aplikasi : \n' +
                                '    Total limit : \n' +
                                '    Tgl, bln jatuh tempo : \n' +
                                '    Sisa angsuran : Rp.\n\n' +
                                '𝗔𝗣𝗟𝗜𝗞𝗔𝗦𝗜 𝗬𝗔𝗡𝗚 𝗦𝗨𝗗𝗔𝗛 𝗚𝗔𝗚𝗔𝗟 𝗕𝗔𝗬𝗔𝗥\n' +
                                '(wajib diisi jika ada)\n' +
                                '1. \n' +
                                '2. \n' +
                                '3. \n\n' +
                                '𝗔𝗣𝗟𝗜𝗞𝗔𝗦𝗜 𝗬𝗔𝗡𝗚 𝗧𝗘𝗥𝗧𝗢𝗟𝗔𝗞 𝗗𝗔𝗟𝗔𝗠 𝗣𝗘𝗡𝗚𝗔𝗝𝗨𝗔𝗡 𝗦𝗘𝗡𝗗𝗜𝗥𝗜 𝗣𝗔𝗗𝗔 𝟭 𝗕𝗨𝗟𝗔𝗡 𝗧𝗘𝗥𝗔𝗞𝗛𝗜𝗥\n' +
                                '(wajib diisi jika ada)\n' +
                                '1. \n' +
                                '2. \n' +
                                '3. \n' +
                                '4.'
                        };
                        sock.sendMessage(message.key.remoteJid, responseMessage1);
                        // Tandai pesan sebagai dibaca
                    }
                    const key = {
                        remoteJid: message.key.remoteJid,
                        id: message.key.id, // id dari pesan yang ingin ditandai sebagai dibaca
                        participant: message.key.participant, // ID pengguna yang mengirim pesan (undefined untuk chat individu)
                    };

                    sock.readMessages([key]);
                }
                // Jika pesan adalah "1"
                else if (invalidNumbers.includes(conversation)) {
                    // Pesan adalah angka tetapi bukan 1-6
                    const responseMessage1 = {
                        text: 'Mohon maaf pilihanmu tidak tersedia🙏',
                    };
                    sock.sendMessage(message.key.remoteJid, responseMessage1);
                    setTimeout(() => {
                        // Kirim pesan kedua
                        const responseMessage2 = {
                            text: "Silahkan ketik angka di bawah ini :\n📲Ketik 1 untuk info Legalitas\n📲Ketik 2 untuk info cara kerja\n📲Ketik 3 untuk info cara kerja antar kota\n📲Ketik 4 untuk info yang sudah galbay\n📲Ketik 5 untuk info ongkos jasa\n📲Ketik 6 untuk isi Form Pendaftaran\nAdmin akan segera merespon setelah pengisian Form Pendaftaran"
                        };
                        sock.sendMessage(message.key.remoteJid, responseMessage2);
                    }, 1000);
                }
                else if (message.message.conversation.toLocaleLowerCase().includes('formulir pendaftaran')) {
                    // Kirim pesan balasan
                    const reactionMessage = {
                        react: {
                            text: "📝", // use an empty string to remove the reaction
                            key: message.key,
                        },
                    };
                    sock.sendMessage(message.key.remoteJid, reactionMessage);
                    setTimeout(() => {
                        const responseMessage = {
                            text: 'Baik, admin akan segera menelpon. Terima kasih🙏🏻🙂'
                        };
                        sock.sendMessage(message.key.remoteJid, responseMessage,);
                    }, 1000)
                    const key = {
                        remoteJid: message.key.remoteJid,
                        id: message.key.id, // id dari pesan yang ingin ditandai sebagai dibaca
                        participant: message.key.participant, // ID pengguna yang mengirim pesan (undefined untuk chat individu)
                    };

                    sock.readMessages([key]);
                }
            } else {

            }





            // Jika message.message memiliki media, maka print media
            if (message.message && message.message.imageMessage) {
                console.log('Message Media:', message.message.imageMessage.url);
            }

            // Dan seterusnya, tambahkan logika untuk properti-properti lainnya sesuai kebutuhan

            console.log('\n'); // Pemisah antara setiap pesan
        });
    });

    sock.ev.on('creds.update', saveCreds);
}

connectionLogic();