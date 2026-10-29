function roundedRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
}

function loadImage(source) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = source;
  });
}

export async function generateIdentityCard(profile, avatarSource, studentName = 'AI Builder') {
  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 820;
  const ctx = canvas.getContext('2d');
  const avatar = await loadImage(avatarSource);
  const background = ctx.createLinearGradient(0, 0, 1200, 820);
  background.addColorStop(0, '#070827');
  background.addColorStop(.55, '#121051');
  background.addColorStop(1, '#050617');
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.globalAlpha = .35;
  ctx.fillStyle = profile.accent ?? '#a33dff';
  ctx.beginPath(); ctx.arc(1070, 80, 210, 0, Math.PI * 2); ctx.fill();
  ctx.globalAlpha = 1;
  roundedRect(ctx, 28, 28, 1144, 764, 34);
  ctx.strokeStyle = profile.accent ?? '#6bd8ff'; ctx.lineWidth = 3; ctx.stroke();

  ctx.fillStyle = '#aeb5ff'; ctx.font = '600 18px Arial';
  ctx.fillText('AI QUEST  /  NIAT INITIATIVE', 78, 86);
  ctx.fillStyle = '#fff'; ctx.font = '700 43px Arial';
  ctx.fillText('YOUR AI BUILDER IDENTITY', 78, 146);
  ctx.fillStyle = profile.accent ?? '#df7dff'; ctx.font = '600 18px Arial';
  ctx.fillText(studentName.toUpperCase(), 78, 184);

  roundedRect(ctx, 78, 225, 350, 475, 24); ctx.fillStyle = 'rgba(22, 20, 91, .82)'; ctx.fill();
  ctx.save(); roundedRect(ctx, 78, 225, 350, 475, 24); ctx.clip();
  const scale = Math.max(350 / avatar.width, 475 / avatar.height);
  const width = avatar.width * scale; const height = avatar.height * scale;
  ctx.drawImage(avatar, 78 + (350 - width) / 2, 225 + (475 - height) / 2, width, height);
  ctx.restore();
  ctx.fillStyle = 'rgba(5, 7, 35, .7)'; ctx.fillRect(78, 585, 350, 115);
  ctx.fillStyle = '#fff'; ctx.font = '700 23px Arial'; ctx.fillText(profile.identity, 103, 642);
  ctx.fillStyle = '#c3c9ef'; ctx.font = '500 16px Arial'; ctx.fillText(profile.rank, 103, 673);

  ctx.fillStyle = '#aeb5ff'; ctx.font = '600 16px Arial'; ctx.fillText('YOUR QUEST PROFILE', 500, 257);
  ctx.fillStyle = '#fff'; ctx.font = '700 36px Arial'; ctx.fillText(profile.identity, 500, 310);
  ctx.fillStyle = '#d6daf8'; ctx.font = '500 20px Arial';
  const words = profile.description.split(' '); let line = ''; let y = 355;
  words.forEach((word) => { const next = `${line}${word} `; if (ctx.measureText(next).width > 560 && line) { ctx.fillText(line.trim(), 500, y); y += 30; line = `${word} `; } else line = next; });
  ctx.fillText(line.trim(), 500, y);
  ctx.fillStyle = profile.accent ?? '#d76cff'; ctx.font = '700 15px Arial'; ctx.fillText(`LEVEL ${profile.level}   •   ${profile.rank}`, 500, y + 55);
  ctx.fillStyle = '#fff'; ctx.font = '700 17px Arial'; ctx.fillText('CORE STRENGTHS', 500, y + 110);
  ctx.font = '500 17px Arial'; profile.strengths.forEach((strength, index) => ctx.fillText(`✦  ${strength}`, 500, y + 145 + index * 30));
  ctx.fillStyle = '#fff'; ctx.font = '700 17px Arial'; ctx.fillText('STARTER PROJECT', 500, y + 255);
  ctx.fillStyle = '#c3c9ef'; ctx.font = '500 17px Arial';
  const projectWords = profile.starterProject.split(' '); line = ''; let projectY = y + 290;
  projectWords.forEach((word) => { const next = `${line}${word} `; if (ctx.measureText(next).width > 560 && line) { ctx.fillText(line.trim(), 500, projectY); projectY += 27; line = `${word} `; } else line = next; });
  ctx.fillText(line.trim(), 500, projectY);
  ctx.fillStyle = '#7782c8'; ctx.font = '500 14px Arial'; ctx.fillText('BUILD YOUR FUTURE WITH AI  •  AI QUEST BY NIAT', 78, 755);
  return canvas.toDataURL('image/png');
}

export function downloadDataUrl(dataUrl, filename = 'ai-quest-identity-card.png') {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
}
