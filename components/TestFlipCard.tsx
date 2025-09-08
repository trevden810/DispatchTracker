'use client'

import { useState } from 'react'
import { Gauge, Truck } from 'lucide-react'

export default function TestFlipCard() {
  const [isFlipped, setIsFlipped] = useState(false)

  console.log('Test flip state:', isFlipped)

  return (
    <div className="max-w-md mx-auto my-8">
      <h3 className="text-lg font-semibold mb-4 text-center">
        Flip Test Component (State: {isFlipped ? 'FLIPPED' : 'NOT FLIPPED'})
      </h3>
      
      <div className="vehicle-card-container">
        <div className={`vehicle-card ${isFlipped ? 'flipped' : ''}`}>
          {/* FRONT SIDE */}
          <div className="vehicle-card-front glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-xl font-bold">FRONT SIDE</h4>
              <button
                onClick={() => {
                  console.log('🔧 FRONT BUTTON CLICKED - Should flip to back')
                  setIsFlipped(true)
                }}
                className="flip-button bg-blue-100 hover:bg-blue-200 text-blue-700 px-4 py-3 rounded-lg"
              >
                <Gauge className="h-5 w-5" />
                <span className="text-sm font-medium">Flip to Back</span>
              </button>
            </div>
            <div className="text-center py-8">
              <p className="text-gray-600">This is the front side of the card</p>
              <p className="text-sm text-gray-500 mt-2">Click button to flip →</p>
            </div>
          </div>

          {/* BACK SIDE */}
          <div className="vehicle-card-back glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-xl font-bold">BACK SIDE</h4>
              <button
                onClick={() => {
                  console.log('🚛 BACK BUTTON CLICKED - Should flip to front')
                  setIsFlipped(false)
                }}
                className="flip-button bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-lg"
              >
                <Truck className="h-5 w-5" />
                <span className="text-sm font-medium">Flip to Front</span>
              </button>
            </div>
            <div className="text-center py-8">
              <p className="text-gray-600">This is the back side of the card</p>
              <p className="text-sm text-gray-500 mt-2">← Click button to flip back</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 p-4 bg-gray-100 rounded-lg">
        <h5 className="font-semibold mb-2">Debug Info:</h5>
        <p>Current State: <code className="bg-white px-2 py-1 rounded">{JSON.stringify({ isFlipped })}</code></p>
        <p>CSS Class: <code className="bg-white px-2 py-1 rounded">vehicle-card {isFlipped ? 'flipped' : ''}</code></p>
      </div>
    </div>
  )
}
