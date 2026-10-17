import { Form } from "react-bootstrap";

type Props = {
    month: string;
    setMonth: React.Dispatch<React.SetStateAction<string>>;
};

const months = [
    "JANUARY",
    "FEBRUARY",
    "MARCH",
    "APRIL",
    "MAY",
    "JUNE",
    "JULY",
    "AUGUST",
    "SEPTEMBER",
    "OCTOBER",
    "NOVEMBER",
    "DECEMBER",
];

function MonthDropdown({ month, setMonth }: Props) {
    return (
        <Form.Select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
        >
            {months.map((m) => (
                <option key={m} value={m}>
                    {m}
                </option>
            ))}
        </Form.Select>
    );
}

export default MonthDropdown;