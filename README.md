# AGUS

AGUS (Adhi Green Useful Sustainability) is a frontend prototype for green building and green construction management. The current experience uses illustrative sample data for **Adhi Green Building – Head Office**; it does not connect to a production backend or certify a project.

## Run locally

Install Node.js 20 or newer, then from this folder run:

```bash
npm install
npm run dev
```

To create a production build, run `npm run build`.

## Login Google dan akun

Login email/password dan Google menggunakan Firebase Authentication. Salin `.env.example` menjadi `.env.local`, lalu isi nilai Web App dari Firebase Console (`apiKey`, `authDomain`, `projectId`, dan `appId`). Di Firebase Console, aktifkan **Authentication → Sign-in method → Email/Password** dan **Google**, lalu tambahkan domain aplikasi pada **Authentication → Settings → Authorized domains**. Jalankan ulang server setelah mengubah `.env.local`. Jangan commit `.env.local`.

### Peran pengguna dan Super Admin

AGUS menyediakan empat role: **Super Admin** (akses sistem penuh), **Admin** (pengelolaan workspace dan proyek), **Project Manager** (pengelolaan proyek dan catatan operasional), serta **Member** (membaca proyek dan mengelola bukti/inspeksi). Role tersimpan sebagai Firebase Auth custom claim `agusRole`, bukan sebagai nilai yang dapat diubah dari form/browser. Firestore Rules di `firestore.rules` memeriksa claim tersebut.

Untuk memberi akun `dp.danihamdani@gmail.com` role Super Admin:

1. Aktifkan Firebase Authentication dan Firestore pada Firebase project yang sama.
2. Buat service account khusus provisioning dengan izin minimum untuk mengelola Firebase Authentication, lalu simpan file JSON di luar repository. Jangan kirim atau commit file ini.
3. Atur `GOOGLE_APPLICATION_CREDENTIALS` ke path file service account di terminal lokal. Untuk akun baru, jalankan `npm run create:super-admin`; kata sandi baru diminta secara tersembunyi di terminal. Script tidak membaca atau menyimpan kata sandi dari source code. Jika akun sudah ada, script hanya memasang claim Super Admin dan kata sandinya tidak diubah.
4. Deploy rules dengan Firebase CLI: `firebase deploy --only firestore:rules`.
5. Keluar lalu masuk kembali agar token memuat role terbaru.

Jangan gunakan kembali kata sandi yang pernah dibagikan di chat. Gunakan kata sandi baru dan unik. Hak istimewa hanya dapat diberikan melalui Admin SDK/service account tepercaya; jangan menambahkannya ke konfigurasi frontend `VITE_*`.

## Android APK

The Android app is wrapped with Capacitor. Install JDK 21 and Android SDK Platform 35 with Android Build Tools, then configure `JAVA_HOME` and `ANDROID_HOME` (or `ANDROID_SDK_ROOT`). Open `android/` in Android Studio once if you prefer to install and accept SDK components through its SDK Manager.

Build a debug APK from the project root with:

```bash
npm install
npm run android:apk
```

The APK is written to `android/app/build/outputs/apk/debug/app-debug.apk`. The debug APK is intended for testing and sideloading, not Play Store release. For a signed release, configure a private signing key in Android Studio or Gradle; do not commit keystores or passwords.

## Prototype scope

The dashboard includes project and period selection, sustainability KPIs, internal assessment scoring, category progress, site activity, a working construction checklist, evidence upload interaction, report CSV export, responsive navigation, and a light/dark appearance toggle. Email/password and Google authentication are provided through Firebase when configured. Project records and measurements remain illustrative demo data; organization isolation, official standards content, sensor ingestion, BIM integration, and project-data backend services are not implemented.

## Compliance note

AGUS supports assessment, monitoring, documentation, and improvement workflows. Regulations and rating systems must be checked against official current documents. AGUS assessment scores and readiness indicators are not official Bangunan Gedung Hijau or GBCI certification.