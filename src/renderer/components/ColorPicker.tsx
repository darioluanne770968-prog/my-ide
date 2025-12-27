import React, { useState, useEffect } from 'react';

interface ColorPickerProps {
  initialColor?: string;
  onSelect: (color: string) => void;
  onClose: () => void;
}

interface ColorFormat {
  hex: string;
  rgb: { r: number; g: number; b: number };
  hsl: { h: number; s: number; l: number };
  hsv: { h: number; s: number; v: number };
}

function ColorPicker({ initialColor = '#3498db', onSelect, onClose }: ColorPickerProps) {
  const [color, setColor] = useState<ColorFormat>(parseColor(initialColor));
  const [inputHex, setInputHex] = useState(initialColor);
  const [recentColors, setRecentColors] = useState<string[]>([]);
  const [format, setFormat] = useState<'hex' | 'rgb' | 'hsl'>('hex');

  const presetColors = [
    '#e74c3c', '#e91e63', '#9b59b6', '#673ab7',
    '#3498db', '#2196f3', '#00bcd4', '#009688',
    '#2ecc71', '#4caf50', '#8bc34a', '#cddc39',
    '#f1c40f', '#ffeb3b', '#ff9800', '#ff5722',
    '#795548', '#9e9e9e', '#607d8b', '#000000'
  ];

  function parseColor(hex: string): ColorFormat {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) {
      return parseColor('#3498db');
    }

    const r = parseInt(result[1], 16);
    const g = parseInt(result[2], 16);
    const b = parseInt(result[3], 16);

    const rgb = { r, g, b };
    const hsl = rgbToHsl(r, g, b);
    const hsv = rgbToHsv(r, g, b);

    return {
      hex: hex.startsWith('#') ? hex : `#${hex}`,
      rgb,
      hsl,
      hsv
    };
  }

  function rgbToHsl(r: number, g: number, b: number) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }

    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
  }

  function rgbToHsv(r: number, g: number, b: number) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0;
    const v = max;
    const d = max - min;
    const s = max === 0 ? 0 : d / max;

    if (max !== min) {
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }

    return { h: Math.round(h * 360), s: Math.round(s * 100), v: Math.round(v * 100) };
  }

  function hslToRgb(h: number, s: number, l: number) {
    h /= 360; s /= 100; l /= 100;
    let r, g, b;

    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };

      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }

    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255)
    };
  }

  function rgbToHex(r: number, g: number, b: number) {
    return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
  }

  const updateColorFromHsl = (h: number, s: number, l: number) => {
    const rgb = hslToRgb(h, s, l);
    const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
    setColor({
      hex,
      rgb,
      hsl: { h, s, l },
      hsv: rgbToHsv(rgb.r, rgb.g, rgb.b)
    });
    setInputHex(hex);
  };

  const updateColorFromRgb = (r: number, g: number, b: number) => {
    const hex = rgbToHex(r, g, b);
    setColor({
      hex,
      rgb: { r, g, b },
      hsl: rgbToHsl(r, g, b),
      hsv: rgbToHsv(r, g, b)
    });
    setInputHex(hex);
  };

  const handleHexInput = (value: string) => {
    setInputHex(value);
    if (/^#[0-9a-fA-F]{6}$/.test(value)) {
      setColor(parseColor(value));
    }
  };

  const selectColor = () => {
    const colorStr = format === 'hex'
      ? color.hex
      : format === 'rgb'
        ? `rgb(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b})`
        : `hsl(${color.hsl.h}, ${color.hsl.s}%, ${color.hsl.l}%)`;

    setRecentColors(prev => [color.hex, ...prev.filter(c => c !== color.hex)].slice(0, 10));
    onSelect(colorStr);
  };

  const copyColor = () => {
    const colorStr = format === 'hex'
      ? color.hex
      : format === 'rgb'
        ? `rgb(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b})`
        : `hsl(${color.hsl.h}, ${color.hsl.s}%, ${color.hsl.l}%)`;

    navigator.clipboard.writeText(colorStr);
  };

  return (
    <div className="color-picker">
      <div className="picker-header">
        <h3>Color Picker</h3>
        <button onClick={onClose} className="close-btn">×</button>
      </div>

      <div className="picker-content">
        <div className="color-preview-large" style={{ backgroundColor: color.hex }}>
          <span className="preview-text" style={{ color: color.hsl.l > 50 ? '#000' : '#fff' }}>
            {color.hex}
          </span>
        </div>

        <div className="color-sliders">
          <div className="slider-group">
            <label>Hue</label>
            <input
              type="range"
              min="0"
              max="360"
              value={color.hsl.h}
              onChange={(e) => updateColorFromHsl(Number(e.target.value), color.hsl.s, color.hsl.l)}
              className="hue-slider"
            />
            <span>{color.hsl.h}°</span>
          </div>

          <div className="slider-group">
            <label>Saturation</label>
            <input
              type="range"
              min="0"
              max="100"
              value={color.hsl.s}
              onChange={(e) => updateColorFromHsl(color.hsl.h, Number(e.target.value), color.hsl.l)}
              className="saturation-slider"
              style={{
                background: `linear-gradient(to right, hsl(${color.hsl.h}, 0%, ${color.hsl.l}%), hsl(${color.hsl.h}, 100%, ${color.hsl.l}%))`
              }}
            />
            <span>{color.hsl.s}%</span>
          </div>

          <div className="slider-group">
            <label>Lightness</label>
            <input
              type="range"
              min="0"
              max="100"
              value={color.hsl.l}
              onChange={(e) => updateColorFromHsl(color.hsl.h, color.hsl.s, Number(e.target.value))}
              className="lightness-slider"
              style={{
                background: `linear-gradient(to right, #000, hsl(${color.hsl.h}, ${color.hsl.s}%, 50%), #fff)`
              }}
            />
            <span>{color.hsl.l}%</span>
          </div>
        </div>

        <div className="color-inputs">
          <div className="input-group">
            <label>HEX</label>
            <input
              type="text"
              value={inputHex}
              onChange={(e) => handleHexInput(e.target.value)}
            />
          </div>
          <div className="input-group rgb-inputs">
            <label>RGB</label>
            <input
              type="number"
              min="0"
              max="255"
              value={color.rgb.r}
              onChange={(e) => updateColorFromRgb(Number(e.target.value), color.rgb.g, color.rgb.b)}
            />
            <input
              type="number"
              min="0"
              max="255"
              value={color.rgb.g}
              onChange={(e) => updateColorFromRgb(color.rgb.r, Number(e.target.value), color.rgb.b)}
            />
            <input
              type="number"
              min="0"
              max="255"
              value={color.rgb.b}
              onChange={(e) => updateColorFromRgb(color.rgb.r, color.rgb.g, Number(e.target.value))}
            />
          </div>
        </div>

        <div className="preset-colors">
          <label>Presets</label>
          <div className="color-grid">
            {presetColors.map(c => (
              <button
                key={c}
                className="color-swatch"
                style={{ backgroundColor: c }}
                onClick={() => setColor(parseColor(c))}
                title={c}
              />
            ))}
          </div>
        </div>

        {recentColors.length > 0 && (
          <div className="recent-colors">
            <label>Recent</label>
            <div className="color-grid">
              {recentColors.map(c => (
                <button
                  key={c}
                  className="color-swatch"
                  style={{ backgroundColor: c }}
                  onClick={() => setColor(parseColor(c))}
                  title={c}
                />
              ))}
            </div>
          </div>
        )}

        <div className="output-format">
          <label>Output Format:</label>
          <select value={format} onChange={(e) => setFormat(e.target.value as any)}>
            <option value="hex">HEX</option>
            <option value="rgb">RGB</option>
            <option value="hsl">HSL</option>
          </select>
        </div>
      </div>

      <div className="picker-actions">
        <button onClick={copyColor}>📋 Copy</button>
        <button onClick={selectColor} className="select-btn">Select Color</button>
      </div>
    </div>
  );
}

export default ColorPicker;
