import { applicationDefault, initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { createInterface } from 'node:readline/promises'
import { stdin, stdout } from 'node:process'

const email = process.env.AGUS_SUPER_ADMIN_EMAIL || 'dp.danihamdani@gmail.com'

function readHidden(prompt) {
  if (!stdin.isTTY || typeof stdin.setRawMode !== 'function') {
    throw new Error('Jalankan script ini langsung di terminal interaktif agar kata sandi dapat dimasukkan secara tersembunyi.')
  }

  return new Promise((resolve, reject) => {
    stdout.write(prompt)
    let value = ''
    stdin.setRawMode(true)
    stdin.resume()
    const onData = chunk => {
      for (const character of chunk.toString()) {
        if (character === '\u0003') {
          cleanup()
          reject(new Error('Dibatalkan.'))
          return
        }
        if (character === '\r' || character === '\n') {
          cleanup()
          stdout.write('\n')
          resolve(value)
          return
        }
        if (character === '\u007f' || character === '\b') {
          value = value.slice(0, -1)
        } else {
          value += character
        }
      }
    }
    const cleanup = () => {
      stdin.off('data', onData)
      stdin.setRawMode(false)
      stdin.pause()
    }
    stdin.on('data', onData)
  })
}

async function main() {
  if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    throw new Error('Atur GOOGLE_APPLICATION_CREDENTIALS ke path service account Firebase Admin SDK. Jangan commit file kredensial tersebut.')
  }

  initializeApp({ credential: applicationDefault() })
  const auth = getAuth()
  let user

  try {
    user = await auth.getUserByEmail(email)
    stdout.write(`Akun ${email} sudah ada. Role Super Admin akan dipasang.\n`)
  } catch (error) {
    if (error.code !== 'auth/user-not-found') throw error
    const password = await readHidden(`Buat kata sandi baru untuk ${email} (input tersembunyi): `)
    if (password.length < 12) throw new Error('Kata sandi harus minimal 12 karakter.')
    user = await auth.createUser({ email, password, displayName: 'Dani Hamdani', emailVerified: false })
  }

  await auth.setCustomUserClaims(user.uid, { ...user.customClaims, agusRole: 'super_admin' })
  stdout.write(`Selesai: ${email} diberi role Super Admin.\n`)
  stdout.write('Keluar lalu masuk kembali agar custom claim diperbarui di token Firebase.\n')
}

main().catch(error => {
  stdout.write(`Gagal: ${error.message}\n`)
  process.exitCode = 1
})