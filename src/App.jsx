import { useState, useCallback, useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { toPng, toSvg } from 'html-to-image';
import { Toaster, toast } from 'react-hot-toast';
import { Switch } from '@headlessui/react';

function App() {
  const [text, setText] = useState('');
  const [size, setSize] = useState(256);
  const [fgColor, setFgColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [level, setLevel] = useState('L');
  const [includeMargin, setIncludeMargin] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const qrRef = useRef();

  const handleDownload = useCallback(async (format) => {
    try {
      const dataUrl = format === 'PNG' 
        ? await toPng(qrRef.current)
        : await toSvg(qrRef.current);
      
      const link = document.createElement('a');
      link.download = `qr-code.${format.toLowerCase()}`;
      link.href = dataUrl;
      link.click();
      
      toast.success(`Downloaded as ${format}`);
    } catch (err) {
      toast.error('Download failed');
    }
  }, []);

  const handleShare = useCallback(async () => {
    try {
      const dataUrl = await toPng(qrRef.current);
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], 'qr-code.png', { type: 'image/png' });
      
      if (navigator.share) {
        await navigator.share({
          files: [file],
          title: 'QR Code',
          text: 'Check out this QR code!'
        });
      } else {
        throw new Error('Sharing not supported');
      }
    } catch (err) {
      toast.error('Sharing failed');
    }
  }, []);

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            QR Code Generator
          </h1>
          <Switch
            checked={darkMode}
            onChange={setDarkMode}
            className={`${darkMode ? 'bg-blue-600' : 'bg-gray-200'} relative inline-flex h-6 w-11 items-center rounded-full`}
          >
            <span className="sr-only">Dark mode</span>
            <span
              className={`${
                darkMode ? 'translate-x-6' : 'translate-x-1'
              } inline-block h-4 w-4 transform rounded-full bg-white transition`}
            />
          </Switch>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <label className={`block text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                Text or URL
              </label>
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Enter text or URL"
              />
            </div>

            <div>
              <label className={`block text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                Size: {size}x{size}
              </label>
              <input
                type="range"
                min="128"
                max="512"
                value={size}
                onChange={(e) => setSize(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                  Foreground Color
                </label>
                <input
                  type="color"
                  value={fgColor}
                  onChange={(e) => setFgColor(e.target.value)}
                  className="mt-1 block w-full"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                  Background Color
                </label>
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="mt-1 block w-full"
                />
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                Error Correction Level
              </label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="L">Low (7%)</option>
                <option value="M">Medium (15%)</option>
                <option value="Q">Quartile (25%)</option>
                <option value="H">High (30%)</option>
              </select>
            </div>

            <div className="flex items-center">
              <Switch
                checked={includeMargin}
                onChange={setIncludeMargin}
                className={`${includeMargin ? 'bg-blue-600' : 'bg-gray-200'} relative inline-flex h-6 w-11 items-center rounded-full`}
              >
                <span
                  className={`${
                    includeMargin ? 'translate-x-6' : 'translate-x-1'
                  } inline-block h-4 w-4 transform rounded-full bg-white transition`}
                />
              </Switch>
              <span className={`ml-2 text-sm ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                Include Margin
              </span>
            </div>
          </div>

          <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
            <div className="flex justify-center mb-4" ref={qrRef}>
              <QRCodeCanvas
                value={text || 'https://stackblitz.com'}
                size={size}
                level={level}
                includeMargin={includeMargin}
                fgColor={fgColor}
                bgColor={bgColor}
              />
            </div>
            
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => handleDownload('PNG')}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Download PNG
              </button>
              <button
                onClick={() => handleDownload('SVG')}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                Download SVG
              </button>
              <button
                onClick={handleShare}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
              >
                Share
              </button>
            </div>
          </div>
        </div>
      </div>
      <Toaster position="bottom-center" />
    </div>
  );
}

export default App;