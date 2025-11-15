import React from 'react';
import { Home, FileText, ImageIcon, Edit3, Download, Settings, User } from 'lucide-react';
import { Tooltip } from '@radix-ui/react-tooltip'; // or shadcn tooltip wrapper if available


const IconButton = ({ Icon, label, active }) => (
<div className={`w-12 h-12 flex items-center justify-center rounded-xl cursor-pointer ${active ? 'bg-slate-100' : 'hover:bg-slate-50'}`}>
<Icon className="w-5 h-5 text-slate-700" />
</div>
);


export default function Sidebar({ active = 'prompt' }) {
return (
<aside className="w-18 h-screen sticky top-0 border-r border-slate-100 bg-white flex flex-col items-center py-4 gap-4">
<div className="w-full flex flex-col items-center gap-6">
<div className="w-12 h-12 flex items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-sky-400 text-white font-semibold">DM</div>
<nav className="flex flex-col gap-2">
<div className="flex flex-col gap-2">
<IconButton Icon={Home} label="Home" active={active === 'home'} />
<IconButton Icon={FileText} label="Prompt" active={active === 'prompt'} />
<IconButton Icon={ImageIcon} label="Preview" active={active === 'preview'} />
<IconButton Icon={Edit3} label="Editor" active={active === 'editor'} />
<IconButton Icon={Download} label="Export" active={active === 'export'} />
</div>
</nav>
</div>


<div className="mt-auto mb-4 flex flex-col items-center gap-3">
<div className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-slate-50 cursor-pointer">
<Settings className="w-5 h-5 text-slate-600" />
</div>
<div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center">W</div>
</div>
</aside>
);
}

