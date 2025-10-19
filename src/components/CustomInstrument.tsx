import { useState } from 'react';

type Props = {
  onInstrumentAdd: (name: string, file: File) => void;
}

const CustomInstrument = ({ onInstrumentAdd }: Props) => {
  const [name, setName] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && file) {
      onInstrumentAdd(name, file);
      setName('');
      setFile(null);
    }
  };

  return (
    <div className="bg-white border-6 border-black p-6 shadow-brutal-lg">
      <div className="bg-neo-cyan border-4 border-black p-3 mb-4 shadow-brutal-sm">
        <h3 className="text-xl font-black uppercase text-center">ADD CUSTOM SOUND</h3>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label htmlFor="name" className="block text-sm font-black uppercase mb-2">
            NAME
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 bg-white border-4 border-black font-bold shadow-brutal-sm focus:shadow-none focus:translate-x-1 focus:translate-y-1 transition-all"
            required
          />
        </div>
        <div>
          <label htmlFor="file" className="block text-sm font-black uppercase mb-2">
            AUDIO FILE (WAV)
          </label>
          <input
            type="file"
            id="file"
            accept=".wav"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="w-full px-4 py-2 bg-white border-4 border-black font-bold shadow-brutal-sm"
            required
          />
        </div>
        <button
          type="submit"
          className="bg-neo-pink border-4 border-black px-6 py-3 font-black uppercase shadow-brutal hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all active:translate-x-2 active:translate-y-2 active:shadow-none"
        >
          ADD IT!
        </button>
      </form>
    </div>
  );
};

export default CustomInstrument;
