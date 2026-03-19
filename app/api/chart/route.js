import { createCanvas } from 'canvas'

export async function POST(request) {
  try {
    const { type, labels, data, title, color } = await request.json()

    // Chart.js ?°ì´?°ë? HTML/SVGë¡?ë³€??    const chartHTML = generateChartHTML(type, labels, data, title, color)

    return Response.json({ success: true, html: chartHTML })
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}

function generateChartHTML(type, labels, data, title, color) {
  const max = Math.max(...data)
  const barWidth = 100 / labels.length

  if (type === 'bar') {
    const bars = labels.map((label, i) => {
      const height = (data[i] / max) * 100
      return `
        <g transform="translate(${i * barWidth}%, 0)">
          <rect x="10%" y="${100 - height}%" width="80%" height="${height}%"
            fill="${color}" rx="3"/>
          <text x="50%" y="105%" text-anchor="middle"
            font-size="12" fill="#666" font-family="sans-serif">${label}</text>
          <text x="50%" y="${95 - height}%" text-anchor="middle"
            font-size="11" fill="#333" font-family="sans-serif">${data[i]}</text>
        </g>`
    }).join('')

    return `
      <div style="padding:16px">
        <div style="font-size:13px;font-weight:700;color:#333;margin-bottom:12px;text-align:center">${title}</div>
        <svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:160px">
          ${bars}
        </svg>
      </div>`
  }

  if (type === 'line') {
    const points = labels.map((_, i) => {
      const x = (i / (labels.length - 1)) * 360 + 20
      const y = 180 - (data[i] / max) * 160
      return `${x},${y}`
    }).join(' ')

    const dots = labels.map((label, i) => {
      const x = (i / (labels.length - 1)) * 360 + 20
      const y = 180 - (data[i] / max) * 160
      return `
        <circle cx="${x}" cy="${y}" r="4" fill="${color}"/>
        <text x="${x}" y="${y - 10}" text-anchor="middle" font-size="11" fill="#333">${data[i]}</text>
        <text x="${x}" y="198" text-anchor="middle" font-size="11" fill="#666">${label}</text>`
    }).join('')

    return `
      <div style="padding:16px">
        <div style="font-size:13px;font-weight:700;color:#333;margin-bottom:12px;text-align:center">${title}</div>
        <svg viewBox="0 0 400 210" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:160px">
          <polyline points="${points}" fill="none" stroke="${color}" stroke-width="2.5"/>
          ${dots}
        </svg>
      </div>`
  }

  return `<div style="padding:16px;text-align:center;color:#aaa">ê·¸ë˜???ì„± ì¤?..</div>`
import { createCanvas } from 'canvas'

export async function POST(request) {
  try {
    const { type, labels, data, title, color } = await request.json()

    // Chart.js ?°ì´?°ë? HTML/SVGë¡?ë³€??
    const chartHTML = generateChartHTML(type, labels, data, title, color)

    return Response.json({ success: true, html: chartHTML })
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}

function generateChartHTML(type, labels, data, title, color) {
  const max = Math.max(...data)
  const barWidth = 100 / labels.length

  if (type === 'bar') {
    const bars = labels.map((label, i) => {
      const height = (data[i] / max) * 100
      return `
        <g transform="translate(${i * barWidth}%, 0)">
          <rect x="10%" y="${100 - height}%" width="80%" height="${height}%"
            fill="${color}" rx="3"/>
          <text x="50%" y="105%" text-anchor="middle"
            font-size="12" fill="#666" font-family="sans-serif">${label}</text>
          <text x="50%" y="${95 - height}%" text-anchor="middle"
            font-size="11" fill="#333" font-family="sans-serif">${data[i]}</text>
        </g>`
    }).join('')

    return `
      <div style="padding:16px">
        <div style="font-size:13px;font-weight:700;color:#333;margin-bottom:12px;text-align:center">${title}</div>
        <svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:160px">
          ${bars}
        </svg>
      </div>`
  }

  if (type === 'line') {
    const points = labels.map((_, i) => {
      const x = (i / (labels.length - 1)) * 360 + 20
      const y = 180 - (data[i] / max) * 160
      return `${x},${y}`
    }).join(' ')

    const dots = labels.map((label, i) => {
      const x = (i / (labels.length - 1)) * 360 + 20
      const y = 180 - (data[i] / max) * 160
      return `
        <circle cx="${x}" cy="${y}" r="4" fill="${color}"/>
        <text x="${x}" y="${y - 10}" text-anchor="middle" font-size="11" fill="#333">${data[i]}</text>
        <text x="${x}" y="198" text-anchor="middle" font-size="11" fill="#666">${label}</text>`
    }).join('')

    return `
      <div style="padding:16px">
        <div style="font-size:13px;font-weight:700;color:#333;margin-bottom:12px;text-align:center">${title}</div>
        <svg viewBox="0 0 400 210" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:160px">
          <polyline points="${points}" fill="none" stroke="${color}" stroke-width="2.5"/>
          ${dots}
        </svg>
      </div>`
  }

  return `<div style="padding:16px;text-align:center;color:#aaa">ê·¸ë˜???ì„± ì¤?..</div>`
}
