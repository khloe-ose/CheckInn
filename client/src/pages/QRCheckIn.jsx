import { Camera, CameraOff, CheckCircle2, QrCode } from 'lucide-react'
import { Html5Qrcode } from 'html5-qrcode'
import { useCallback, useEffect, useRef, useState } from 'react'
import Alert from '../components/Alert'
import StatusBadge from '../components/StatusBadge'
import api, { getApiError } from '../services/api'
import { formatDateTime } from '../utils/format'

const scannerElementId = 'checkinn-qr-reader'

export default function QRCheckIn() {
  const [qrData, setQrData] = useState('')
  const [participant, setParticipant] = useState(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [cameraActive, setCameraActive] = useState(false)
  const [cameraLoading, setCameraLoading] = useState(false)
  const scannerRef = useRef(null)
  const scanningRef = useRef(false)

  const checkInQr = useCallback(async (value) => {
    const payload = value.trim()
    if (!payload) return

    setError('')
    setMessage('')
    setParticipant(null)
    setLoading(true)
    try {
      const { data } = await api.post('/attendance/qr', { qrData: payload })
      setParticipant(data.participant)
      setMessage(data.message)
      setQrData('')
    } catch (err) {
      setError(getApiError(err, 'Unable to check in QR code.'))
    } finally {
      setLoading(false)
    }
  }, [])

  const stopCamera = useCallback(async () => {
    scanningRef.current = false

    if (!scannerRef.current) {
      setCameraActive(false)
      return
    }

    try {
      if (scannerRef.current.isScanning) {
        await scannerRef.current.stop()
      }
      scannerRef.current.clear()
    } catch {
      // The scanner may already be stopped when React unmounts the reader.
    } finally {
      scannerRef.current = null
      setCameraActive(false)
      setCameraLoading(false)
    }
  }, [])

  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [stopCamera])

  const submit = async (event) => {
    event.preventDefault()
    await checkInQr(qrData)
  }

  const startCamera = async () => {
    setError('')
    setMessage('')
    setCameraLoading(true)

    try {
      const scanner = new Html5Qrcode(scannerElementId)
      scannerRef.current = scanner

      await scanner.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 240, height: 240 },
          aspectRatio: 1,
        },
        async (decodedText) => {
          if (scanningRef.current) return
          scanningRef.current = true
          setQrData(decodedText)
          await stopCamera()
          await checkInQr(decodedText)
        },
      )

      setCameraActive(true)
    } catch (err) {
      setError(
        err?.message ||
          'Unable to start the camera. Check browser camera permission and use localhost or HTTPS.',
      )
      await stopCamera()
    } finally {
      setCameraLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-ocean-700">Attendance</p>
        <h1 className="mt-1 text-3xl font-bold text-slate-950">QR check-in</h1>
      </div>

      <section className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <form className="panel p-5" onSubmit={submit}>
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-md bg-ocean-50 text-ocean-700">
              <QrCode className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-lg font-semibold text-slate-950">Scan result</h2>
              <p className="text-sm text-slate-500">QR payload or token</p>
            </div>
          </div>
          <div className="mt-5 space-y-4">
            <Alert type="error">{error}</Alert>
            <Alert>{message}</Alert>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <div
                id={scannerElementId}
                className="min-h-64 overflow-hidden rounded-md bg-white [&_video]:rounded-md"
              />
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <button
                  type="button"
                  className="btn-primary"
                  onClick={startCamera}
                  disabled={cameraActive || cameraLoading || loading}
                >
                  <Camera className="h-4 w-4" />
                  {cameraLoading ? 'Starting...' : 'Start camera'}
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={stopCamera}
                  disabled={!cameraActive && !cameraLoading}
                >
                  <CameraOff className="h-4 w-4" />
                  Stop camera
                </button>
              </div>
            </div>
            <textarea
              className="input min-h-40"
              required
              placeholder="Paste QR payload or token here if you are not using the camera."
              value={qrData}
              onChange={(event) => setQrData(event.target.value)}
            />
            <button type="submit" className="btn-primary w-full" disabled={loading}>
              <CheckCircle2 className="h-4 w-4" />
              {loading ? 'Checking in...' : 'Check in participant'}
            </button>
          </div>
        </form>

        <div className="panel p-5">
          <h2 className="text-lg font-semibold text-slate-950">Latest check-in</h2>
          {participant ? (
            <div className="mt-5 rounded-lg border border-slate-200 bg-ocean-50 p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-2xl font-bold text-slate-950">{participant.full_name}</p>
                  <p className="mt-1 text-slate-600">{participant.email}</p>
                  <p className="mt-1 text-sm text-slate-500">{participant.event_title}</p>
                </div>
                <StatusBadge status={participant.attendance_status} />
              </div>
              <dl className="mt-6 grid gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Student ID</dt>
                  <dd className="mt-1 text-slate-800">{participant.student_number}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Checked in</dt>
                  <dd className="mt-1 text-slate-800">{formatDateTime(participant.check_in_time)}</dd>
                </div>
              </dl>
            </div>
          ) : (
            <div className="mt-5 rounded-lg border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
              No recent check-in.
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
