import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import logo from '@/assets/login_icons/gaddr_logo.png'
import gaddrIcon from '@/assets/login_icons/gaddr_icon.png'
import xIcon from '@/assets/login_icons/x.png'
import linkedIn from '@/assets/login_icons/linkedIn_logo.png'
import instagram from '@/assets/login_icons/instagram.png'
import tiktok from '@/assets/login_icons/tiktok.png'

const AuthFooter = () => {
  return (
    <footer className='border-t-[1px] border-[#6136FF]/25 w-full mt-auto mb-[50px] pt-[16px] px-8'>
      <div className='w-full flex flex-col items-center md:flex-row md:items-center md:justify-between gap-[12px]'>
        {/* Left: logo + tagline + year */}
        <div className='flex flex-col items-center md:items-start'>
          <div className='flex flex-col items-center md:flex-row md:items-center gap-[12px] mt-5'>
            <Image src={logo} alt="gaddr logo" className="h-8 w-auto" />
            <p className='font-opensans text-[12px] text-[#595959] leading-[14.4px] mt-1 md:mt-0 text-center md:text-left'>Your social media, unified.</p>
          </div>
          <p className='font-opensans text-[12px] text-[#595959] leading-[14.4px] mt-[12px] text-center md:text-left'>2025 Gaddr Search & Me. All rights reserved.</p>
        </div>
        {/* Center: links */}
        <div className='flex justify-center gap-8 md:gap-10'>
          <Link href="#" className='font-opensans font-bold text-[12px] text-[#595959] leading-[16px]'>Help Center</Link>
          <Link href="#" className='font-opensans font-bold text-[12px] text-[#595959] leading-[16px]'>Contact Us</Link>
          <Link href="#" className='font-opensans font-bold text-[12px] text-[#595959] leading-[16px]'>Privacy & Terms</Link>
        </div>
        {/* Right: social icons */}
        <div className='w-full md:w-auto flex items-center justify-center md:justify-end gap-[14px] mt-1'>
          <button type="button" aria-label="Continue with Gaddr" className='p-[8px] bg-gradient-to-r from-[#6400BF] to-[#0F13B9] w-[40px] h-[40px] rounded-full border border-[#B9B3F2] transition-colors flex items-center justify-center shadow-[0px_2px_4px_rgba(97,54,255,0.15)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6136FF]'>
            <Image src={gaddrIcon} alt="Gaddr" className='w-[24px]' />
          </button>
          <button type="button" aria-label="Continue with X" className='p-[8px] bg-gradient-to-r from-[#6400BF] to-[#0F13B9] w-[40px] h-[40px] rounded-full border border-[#B9B3F2] transition-colors flex items-center justify-center shadow-[0px_2px_4px_rgba(97,54,255,0.15)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6136FF]'>
            <Image src={xIcon} alt="X" className='w-[24px]' />
          </button>
          <button type="button" aria-label="Continue with LinkedIn" className='p-[8px] bg-gradient-to-r from-[#6400BF] to-[#0F13B9] w-[40px] h-[40px] rounded-full border border-[#B9B3F2] transition-colors flex items-center justify-center shadow-[0px_2px_4px_rgba(97,54,255,0.15)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6136FF]'>
            <Image src={linkedIn} alt="LinkedIn" className='w-[24px]' />
          </button>
          <button type="button" aria-label="Continue with Instagram" className='p-[8px] bg-gradient-to-r from-[#6400BF] to-[#0F13B9] w-[40px] h-[40px] rounded-full border border-[#B9B3F2] transition-colors flex items-center justify-center shadow-[0px_2px_4px_rgba(97,54,255,0.15)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6136FF]'>
            <Image src={instagram} alt="Instagram" className='w-[24px]' />
          </button>
          <button type="button" aria-label="Continue with TikTok" className='p-[8px] bg-gradient-to-r from-[#6400BF] to-[#0F13B9] w-[40px] h-[40px] rounded-full border border-[#B9B3F2] transition-colors flex items-center justify-center shadow-[0px_2px_4px_rgba(97,54,255,0.15)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6136FF]'>
            <Image src={tiktok} alt="TikTok" className='w-[24px]' />
          </button>
        </div>
      </div>
    </footer>
  )
}

export default AuthFooter