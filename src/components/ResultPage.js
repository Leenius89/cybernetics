import React, { useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import ThreeDModel from './ThreeDModel';
import { Radar } from 'react-chartjs-2';
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from 'chart.js';
import { OBJExporter } from 'three/examples/jsm/exporters/OBJExporter';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

const ResultPage = ({ testResults, parts, userName, onRestart }) => {
  const canvasRef = useRef();
  const [shareMenuOpen, setShareMenuOpen] = useState(false);
  const [downloadMenuOpen, setDownloadMenuOpen] = useState(false);
  const [email, setEmail] = useState('');

  const downloadImage = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const dataUrl = canvas.toDataURL('image/jpg');
      const link = document.createElement('a');
      link.download = 'psyche_test_result.jpg';
      link.href = dataUrl;
      link.click();
    }
  };

  const downloadSVG = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const svgData = new XMLSerializer().serializeToString(canvas);
      const svgBlob = new Blob([svgData], {type: "image/svg+xml;charset=utf-8"});
      const svgUrl = URL.createObjectURL(svgBlob);
      const downloadLink = document.createElement("a");
      downloadLink.href = svgUrl;
      downloadLink.download = "psyche_test_result.svg";
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  };

  const download3DModel = (format) => {
    const canvas = canvasRef.current;
    if (canvas) {
      let content, type, filename;
      if (format === 'obj') {
        const exporter = new OBJExporter();
        content = exporter.parse(canvas.scene);
        type = 'text/plain';
        filename = 'psyche_test_result.obj';
      } else if (format === 'gltf') {
        // GLTF export logic here
        // This is a placeholder and needs to be implemented
        alert('GLTF export not implemented yet');
        return;
      }
      const blob = new Blob([content], { type });
      const link = document.createElement('a');
      link.download = filename;
      link.href = URL.createObjectURL(blob);
      link.click();
    }
  };

  const shareViaEmail = () => {
    if (email) {
      const subject = encodeURIComponent('My Psyche Test Results');
      const body = encodeURIComponent(`Check out my psyche test results: ${window.location.href}`);
      window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
    } else {
      alert('Please enter an email address');
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href)
      .then(() => alert('Link copied to clipboard!'))
      .catch(err => console.error('Failed to copy link: ', err));
  };

  const shareSNS = (platform) => {
    let url = '';
    const text = encodeURIComponent('Check out my psyche test results!');
    const shareUrl = encodeURIComponent(window.location.href);

    switch(platform) {
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`;
        break;
      case 'twitter':
        url = `https://twitter.com/intent/tweet?text=${text}&url=${shareUrl}`;
        break;
      case 'instagram':
        alert('Instagram sharing is not directly supported. You can copy the link and share it manually.');
        return;
      case 'kakao':
        alert('Kakao sharing functionality needs to be implemented with Kakao SDK');
        return;
      default:
        alert('Unsupported sharing platform');
        return;
    }

    window.open(url, '_blank');
  };

  const radarData = {
    labels: ['Perception', 'Intelligence', 'Emotion', 'Physical', 'Hidden'],
    datasets: [
      {
        label: 'Test Results',
        data: [testResults.perception, testResults.intelligence, testResults.emotion, testResults.physical, testResults.hidden],
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(255, 99, 132, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(255, 99, 132, 1)',
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };
  
  const radarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        angleLines: {
          display: true,
          color: 'rgba(255, 99, 132, 0.3)',
        },
        suggestedMin: 0,
        suggestedMax: 100,
        ticks: {
          stepSize: 20,
          callback: function(value) {
            return value + '%';
          },
          font: {
            size: 10
          }
        },
        pointLabels: {
          font: {
            size: 12,
            weight: 'bold',
          },
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
    },
    elements: {
      line: {
        borderWidth: 3,
      },
    },
  };
  return (
    <div className="flex flex-col md:flex-row md:space-x-8">
      <div className="md:w-1/2">
        <h2 className="text-2xl font-bold mb-4">{userName}님의 테스트 결과</h2>
        <div className="mb-6 h-64">
          <Radar data={radarData} options={radarOptions} />
        </div>
        {Object.entries(testResults).map(([key, value]) => (
          <div key={key} className="mb-2">
            <span className="font-semibold">{key}: </span>
            <span>{value.toFixed(2)}</span>
          </div>
        ))}
        <h3 className="text-xl font-bold mt-6 mb-2">발견된 능력</h3>
        {Object.entries(parts).map(([key, abilities]) => (
          <div key={key} className="mb-2">
            <span className="font-semibold">{key}: </span>
            <span>{abilities.join(', ')}</span>
          </div>
        ))}
        <div className="mt-6 space-y-2">
          <div className="flex space-x-2">
            <button onClick={downloadImage} className="flex-1 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
              이미지 다운로드
            </button>
            <div className="relative flex-1">
              <button onClick={() => setDownloadMenuOpen(!downloadMenuOpen)} className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
                3D 모델 다운로드
              </button>
              {downloadMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                  <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                    <button onClick={() => download3DModel('obj')} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 w-full text-left" role="menuitem">OBJ 다운로드</button>
                    <button onClick={() => download3DModel('gltf')} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 w-full text-left" role="menuitem">GLTF 다운로드</button>
                    <button onClick={downloadSVG} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 w-full text-left" role="menuitem">SVG 다운로드</button>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="flex space-x-2">
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="이메일 주소 입력"
              className="flex-grow px-4 py-2 border rounded"
            />
            <button 
              onClick={shareViaEmail} 
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              전송
            </button>
          </div>
          <div className="flex space-x-2">
            <button onClick={copyLink} className="flex-1 bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600">
              링크 복사
            </button>
            <button onClick={() => setShareMenuOpen(!shareMenuOpen)} className="flex-1 bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600">
              SNS 공유
            </button>
            <button onClick={onRestart} className="flex-1 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
              처음으로
            </button>
          </div>
          {shareMenuOpen && (
            <div className="flex justify-around mt-2">
              <button onClick={() => shareSNS('facebook')} className="p-2 bg-blue-600 text-white rounded">Facebook</button>
              <button onClick={() => shareSNS('twitter')} className="p-2 bg-blue-400 text-white rounded">Twitter</button>
              <button onClick={() => shareSNS('instagram')} className="p-2 bg-pink-500 text-white rounded">Instagram</button>
              <button onClick={() => shareSNS('kakao')} className="p-2 bg-yellow-400 text-white rounded">KakaoTalk</button>
            </div>
          )}
        </div>
        <div className="mt-8">
          <h3 className="text-xl font-bold mb-2">결과 설명</h3>
          <p>
            {userName}님의 사이버네틱 능력 테스트 결과, 당신은 {Object.entries(testResults).sort((a, b) => b[1] - a[1])[0][0]} 영역에서 특히 뛰어난 능력을 보여주셨습니다. 
            이는 현대 사회에서 매우 유용한 능력으로, 앞으로의 삶에서 큰 강점이 될 것입니다. 
            다만, {Object.entries(testResults).sort((a, b) => a[1] - b[1])[0][0]} 영역은 상대적으로 낮은 점수를 보이고 있어, 이 부분에 대한 개발이 필요할 것 같습니다.
            전반적으로 균형 잡힌 능력을 보여주고 계시며, 이를 바탕으로 다양한 분야에서 성공을 이룰 수 있을 것입니다.
          </p>
        </div>
      </div>
      <div className="md:w-1/2 h-[600px] md:h-auto">
        <Canvas ref={canvasRef} camera={{ position: [0, 0, 5] }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          <ThreeDModel testResults={testResults} parts={parts} />
          <OrbitControls />
        </Canvas>
      </div>
    </div>
  );
};

export default ResultPage;