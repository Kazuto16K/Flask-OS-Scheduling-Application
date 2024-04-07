from flask import Flask, render_template,request,redirect,url_for,json,session

app = Flask(__name__)
app.secret_key = 'mxlkaliakmxlkalmxlk'

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/', methods=['POST'])
def redirect_to_url():
    selected_algo = request.form["scheduling-algo"]
    print(selected_algo)
    return redirect("/algo?sel_algo=" +  selected_algo)

@app.route('/algo')
def algo():
    selected_algo = request.args.get("sel_algo")
    if selected_algo == "FCFS":
        algorithm = "First Come First Serve Algorithm"
    elif selected_algo == "SJF":
        algorithm = "Shortest Job First Algorithm"
    elif selected_algo == "SRTF":
        algorithm = "Shortest Remaining Time First Algorithm"
    elif selected_algo == "RR":
        algorithm = "Round Robin Algorithm"
    return render_template('algo.html', algo = algorithm)
    
@app.route('/result')
def show_results():
    processed_data = session.get('processed_data', [])
    avg_times = session.get('avg_time',[])
    chart_vars = session.get('chart_vars',[])
    
    for times in avg_times:
        tat = times['tat']
        wt = times['wt']

        tat = round(tat,2)
        wt = round(wt,2)

    for vars in chart_vars:
        fcfstat = vars['FCFSTAT']
        fcfswt = vars['FCFSWT']
        sjftat = vars['SJFTAT']
        sjfwt = vars['SJFWT']
        srtftat = vars['SRTFTAT']
        srtfwt = vars['SRTFWT']

    return render_template('result.html', data=processed_data, tat=tat, wt=wt,
                           fcfstat=fcfstat,fcfswt=fcfswt,sjftat=sjftat,sjfwt=sjfwt,
                           srtftat=srtftat,srtfwt=srtfwt)

@app.route('/results', methods = ['POST'])
def save_data():
    data = request.get_json()

    processed_data = []
    print("Data Received")
    for obj in data[:-2]:
        pid = obj.get('pid')
        bt = obj.get('bt')
        at = obj.get('at')
        ct = obj.get('ct')
        wt = obj.get('wt')
        tat = obj.get('tat')
        
        
        processed_data.append({'pid': pid, 'bt': bt, 'at': at, 'ct': ct, 'wt': wt, 'tat': tat})

    avg_times = data[-2]
    avgWT = avg_times.get('wt')
    avgTAT = avg_times.get('tat')

    avgTIME = []
    avgTIME.append({'wt':avgWT, 'tat':avgTAT})
    print(avgTIME)

    chart_vars = data[-1]
    print(chart_vars)
    fcfsTAT = chart_vars.get('FCFSTAT')
    fcfsWT = chart_vars.get('FCFSWT')
    sjfTAT = chart_vars.get('SJFTAT')
    sjfWT = chart_vars.get('SJFWT')
    srtfTAT = chart_vars.get('SRTFTAT')
    srtfWT = chart_vars.get('SRTFWT')

    chartVARS = []
    chartVARS.append({'FCFSTAT': fcfsTAT, 'FCFSWT': fcfsWT, 'SJFTAT': sjfTAT, 'SJFWT': sjfWT, 'SRTFTAT': srtfTAT, 'SRTFWT': srtfWT})

    session['processed_data'] = processed_data
    session['avg_time'] = avgTIME
    session['chart_vars'] = chartVARS
    
    return redirect(url_for('show_results'))

@app.route('/about')
def about():
    return render_template('about.html')

@app.route('/info')
def info():
    return render_template('info.html')

if __name__ == '__main__':
    app.run(debug=True)