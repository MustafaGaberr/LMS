import React from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { Button } from '../components/Button';
import './SurveyResults.css';

const LABELS = ['ضعيف جدًا', 'ضعيف', 'متوسط', 'جيد', 'ممتاز'];
const BAR_COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6'];

const QUESTION_LABELS: Record<string, string> = {
    q1: 'جودة المحتوى',
    q2: 'سهولة الاستخدام',
    q3: 'الأنشطة والتقييم',
    q4: 'القيمة المضافة',
    q5: 'التجربة الإجمالية',
};

interface ChartBar { name: string; count: number; fill: string; }

const SurveyResults: React.FC = () => {
    const navigate = useNavigate();
    const surveyAggregates = useAppStore((s) => s.surveyAggregates);
    const resetSurveyStats = useAppStore((s) => s.resetSurveyStats);

    const questionIds = Object.keys(QUESTION_LABELS);
    const hasData = questionIds.some((qId) => {
        const agg = surveyAggregates[qId];
        return agg && Object.values(agg).some((v) => v > 0);
    });

    if (!hasData) {
        return (
            <div className="results-page results-page--empty">
                <div className="results-empty-icon">📊</div>
                <h2 className="results-empty-title">لا توجد بيانات بعد</h2>
                <p className="results-empty-desc">
                    لم يُكمل أي متعلم الاستبيان حتى الآن.
                </p>
                <Button variant="ghost" onClick={() => navigate(-1)}>
                    رجوع
                </Button>
            </div>
        );
    }

    return (
        <div className="results-page">
            <div className="results-header">
                <h2 className="results-header__title">نتائج الاستبيان</h2>
                <p className="results-header__sub">إحصاءات مجمّعة مجهولة الهوية</p>
            </div>

            <div className="results-charts">
                {questionIds.map((qId) => {
                    const agg = surveyAggregates[qId] ?? {};
                    const data: ChartBar[] = [1, 2, 3, 4, 5].map((val) => ({
                        name: LABELS[val - 1],
                        count: agg[val] ?? 0,
                        fill: BAR_COLORS[val - 1],
                    }));
                    const total = data.reduce((s, d) => s + d.count, 0);
                    const avg = total > 0
                        ? (data.reduce((s, d, i) => s + d.count * (i + 1), 0) / total).toFixed(1)
                        : '—';

                    return (
                        <div key={qId} className="results-chart-card">
                            <div className="results-chart-card__header">
                                <p className="results-chart-card__title">
                                    {QUESTION_LABELS[qId]}
                                </p>
                                <div className="results-chart-card__meta">
                                    <span>{total} إجابة</span>
                                    <span className="results-chart-card__avg">
                                        متوسط: {avg}/5
                                    </span>
                                </div>
                            </div>

                            <ResponsiveContainer width="100%" height={160}>
                                <BarChart
                                    data={data}
                                    margin={{ top: 4, right: 4, left: -16, bottom: 0 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                                    <XAxis
                                        dataKey="name"
                                        tick={{ fontSize: 10, fill: 'var(--color-text-3)', fontFamily: 'Cairo' }}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <YAxis
                                        allowDecimals={false}
                                        tick={{ fontSize: 10, fill: 'var(--color-text-3)', fontFamily: 'Cairo' }}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <Tooltip
                                        formatter={(v: number) => [`${v} إجابة`, 'العدد']}
                                        contentStyle={{
                                            fontFamily: 'Cairo, Tajawal, sans-serif',
                                            direction: 'rtl',
                                            borderRadius: 12,
                                            border: '1px solid var(--color-border)',
                                            fontSize: 12,
                                        }}
                                    />
                                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                                        {data.map((entry, i) => (
                                            <Cell key={i} fill={entry.fill} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    );
                })}
            </div>

            <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                    if (window.confirm('هل تريد مسح جميع إحصاءات الاستبيان؟')) {
                        resetSurveyStats();
                    }
                }}
            >
                🗑 إعادة تعيين الإحصاءات
            </Button>
        </div>
    );
};

export default SurveyResults;
