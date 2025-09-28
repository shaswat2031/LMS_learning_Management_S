import React from 'react'
import { assets } from '../../assets/assets'

const Companies = () => {
  const companies = [
    { src: assets.microsoft_logo, alt: "Microsoft" },
    { src: assets.walmart_logo, alt: "Walmart" },
    { src: assets.adobe_logo, alt: "Adobe" },
    { src: assets.accenture_logo, alt: "Accenture" },
    { src: assets.paypal_logo, alt: "PayPal" }
  ]

  return (
    <div className='py-16 px-4'>
      <div className='max-w-6xl mx-auto text-center'>
        <p className='text-sm md:text-base text-gray-500 mb-8'>
          Trusted by leading companies worldwide
        </p>
        <div className='flex flex-wrap items-center justify-center gap-8 md:gap-12 lg:gap-16'>
          {companies.map((company, index) => (
            <div key={index} className='flex-shrink-0'>
              <img 
                src={company.src} 
                alt={`${company.alt} logo`} 
                className='h-8 md:h-12 lg:h-16 object-contain opacity-60 hover:opacity-100 transition-all duration-300 hover:scale-105 grayscale hover:grayscale-0'
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Companies