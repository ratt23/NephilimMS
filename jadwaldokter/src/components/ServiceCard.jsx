import React from 'react';

const ServiceCard = ({ service }) => {
    return (
        <div className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-[#01007f]/30 hover:shadow-xl transition-all duration-300 group">
            <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#01007f]/10 to-[#0c4a6e]/10 flex items-center justify-center text-3xl flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                    {service.icon}
                </div>

                <div className="flex-grow">
                    <h3 className="font-bold text-lg text-[#1f2937] mb-2 group-hover:text-[#01007f] transition-colors">
                        {service.title}
                    </h3>
                    <p className="text-sm text-slate-600 mb-3 leading-relaxed">
                        {service.description}
                    </p>

                    {service.features && service.features.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                            {service.features.map((feature, idx) => (
                                <span
                                    key={idx}
                                    className="text-xs px-3 py-1 bg-slate-100 text-slate-700 rounded-full border border-slate-200"
                                >
                                    {feature}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ServiceCard;
