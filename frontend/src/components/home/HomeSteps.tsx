import { Container } from 'react-bootstrap';

const steps = [
    { number: '01', title: 'Chọn cách đặt', description: 'Xem thực đơn có sẵn hoặc tự chọn món theo nhu cầu.' },
    { number: '02', title: 'Chọn đầu bếp và lịch', description: 'Tham khảo đầu bếp, số người ăn và thời gian phục vụ.' },
    { number: '03', title: 'Kiểm tra thông tin', description: 'Xem lại món ăn, khẩu vị và ngân sách dự kiến.' },
    { number: '04', title: 'Thưởng thức tại nhà', description: 'Đầu bếp đến nấu trực tiếp và dọn dẹp sau bữa ăn.' },
];

export default function HomeSteps() {
    return (
            <section className="gc-home-section gc-home-steps" id="cach-hoat-dong">
                <Container>
                    <div className="gc-home-heading gc-home-heading-center">
                        <p className="gc-home-kicker">CÁCH GOCOOK HOẠT ĐỘNG</p>
                        <h2>4 bước cho một bữa ăn tại nhà</h2>
                        <p>Chọn món và chuẩn bị thông tin trước khi kết nối dịch vụ đặt nấu chính thức.</p>
                    </div>
                    <div className="gc-home-steps-grid">
                        {steps.map((step) => (
                            <article className="gc-home-step" key={step.number}>
                                <span className="gc-home-step-number">{step.number}</span>
                                <h3>{step.title}</h3>
                                <p>{step.description}</p>
                            </article>
                        ))}
                    </div>
                </Container>
            </section>
    );
}
