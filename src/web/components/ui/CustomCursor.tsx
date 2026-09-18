import React, { useEffect, useState } from 'react';

export const CustomCursor: React.FC = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [target, setTarget] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setTarget({ x: e.clientX, y: e.clientY });
    };
    
    const handleMouseOver = (e: MouseEvent) => {
      const targetEl = e.target as HTMLElement;
      if (
        targetEl.tagName.toLowerCase() === 'button' ||
        targetEl.tagName.toLowerCase() === 'a' ||
        targetEl.closest('button') ||
        targetEl.closest('a') ||
        targetEl.closest('.vh-interactive') ||
        targetEl.closest('.group\\/row')
      ) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseover', handleMouseOver);

    let animationFrameId: number;
    const updatePosition = () => {
      setPosition(prev => {
        const dx = target.x - prev.x;
        const dy = target.y - prev.y;
        return {
          x: prev.x + dx * 0.25,
          y: prev.y + dy * 0.25
        };
      });
      animationFrameId = requestAnimationFrame(updatePosition);
    };
    updatePosition();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseover', handleMouseOver);
      cancelAnimationFrame(animationFrameId);
    };
  }, [target]);

  return (
    <div
      className="pointer-events-none fixed top-0 left-0 z-[9999] rounded-full mix-blend-screen transition-all duration-200 ease-out"
      style={{
        transform: 'translate3d(' + position.x + 'px, ' + position.y + 'px, 0) translate(-50%, -50%) scale(' + (isHovering ? 2.5 : 1) + ')',
        width: isHovering ? '32px' : '12px',
        height: isHovering ? '32px' : '12px',
        backgroundColor: isHovering ? 'rgba(0, 210, 255, 0.1)' : '#00d2ff',
        border: isHovering ? '1px solid rgba(0, 210, 255, 0.5)' : 'none',
        boxShadow: isHovering ? '0 0 20px rgba(0, 210, 255, 0.4)' : '0 0 10px #00d2ff, 0 0 20px #0055ff',
      }}
    />
  );
};
